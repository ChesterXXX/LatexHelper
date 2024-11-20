import * as vscode from "vscode";
import * as bibtexParser from "@retorquere/bibtex-parser";
import * as fs from "fs";
import { logMessage } from "../extension";
import { generateFullCitationKey } from "./citationKeyUtils";

function readBibFile(filePath: string): bibtexParser.Library | undefined {
	let bibRawData: string;
	try {
		bibRawData = fs.readFileSync(filePath, "utf-8");
	} catch (err) {
		logMessage(`Could not read bib file: ${filePath}`);
		return;
	}
	try {
		return parseBibLibrary(bibRawData);
	} catch (err) {
		logMessage(`Could not parse bib file: ${filePath}\n${err}`);
		return;
	}
}

function formatBibEntryInput(bibEntry: bibtexParser.Entry, newKey = ""): string {
	let bibInput = bibEntry.input;
	if (newKey) {
		bibInput = bibInput.replace(bibEntry.key, newKey);
	}
	const regex = /([A-Za-z0-9\-]+)\s*=\s*{(.+)}/g;
	bibInput = bibInput.replace(regex, (match, p1, p2) => {
		return `${p1.toLowerCase()} = {${p2}}`;
	});

	return bibInput;
}

function bibLibraryToString(bibData: bibtexParser.Library) {
	return bibData.entries.map((entry) => entry.input).join(`\n\n`);
}

function parseBibLibrary(bibEntries: string | string[]): bibtexParser.Library | undefined {
	try {
		if (Array.isArray(bibEntries)) {
			return bibtexParser.parse(bibEntries.join("\n"));
		} else {
			return bibtexParser.parse(bibEntries);
		}
	} catch (error) {
		logMessage(`Could not parse bib library.`, error);
		return;
	}
}

function writeBibFile(bibData: bibtexParser.Library, filePath: string) {
	try {
		const bibRawData = bibLibraryToString(bibData);
		fs.writeFileSync(filePath, bibRawData, { encoding: "utf-8" });
		return true;
	} catch (error) {
		logMessage(`Could not write to bib file: ${filePath}`, error);
		return false;
	}
}

export function sortBibFileByKey(filePath: string) {
	try {
		const bibData = readBibFile(filePath);
		if (bibData) {
			bibData.entries.sort((a, b) => (a.key.toLocaleLowerCase() < b.key.toLocaleLowerCase() ? -1 : 1));
			if (writeBibFile(bibData, filePath)) {
				logMessage(`Sorted the bib file by citation keys: ${filePath}`);
				vscode.window.showInformationMessage(`Sorted the bib file by citation keys: ${filePath}`);
			}
		}
	} catch (error) {
		logMessage(`Error sorting bib file: ${filePath}`, error);
	}
}

export function checkBibFileForDuplicateKeys(filePath: string) {
	try {
		const bibData = readBibFile(filePath);
		const grouped = new Map<string, Array<bibtexParser.Entry>>();
		bibData?.entries.forEach((entry) => {
			if (entry) {
				const key: string = entry.key;
				if (!grouped.has(key)) {
					grouped.set(key, []);
				}
				grouped.get(key)?.push(entry);
			}
		});
		const result = Array.from(grouped.values()).filter((group) => group.length > 1);
		if (result) {
			vscode.window.showWarningMessage(`Duplicate keys found: ${result.length}`);
			logMessage(`Found groups: ${result.length}`);
		} else {
			vscode.window.showInformationMessage(`No duplicate citation keys found!`);
			logMessage(`No duplicate citation keys found.`);
		}
	} catch (error) {
		logMessage(`Error checking for duplicate keys in bib file: ${filePath}`, error);
	}
}

export function convertCitationKeys(filePath: string) {
	try {
		const bibData = readBibFile(filePath);
		let modifiedBibStr = "";
		if (bibData) {
			bibData.entries.forEach((entry) => {
				const newKey = generateFullCitationKey(entry);
				modifiedBibStr += formatBibEntryInput(entry, newKey) + '\n';
			});
			const modifiedBibData = bibtexParser.parse(modifiedBibStr);
			modifiedBibData.entries.sort((a, b) => (a.key.toLocaleLowerCase() < b.key.toLocaleLowerCase() ? -1 : 1));
			writeBibFile(modifiedBibData, filePath);
			logMessage(`Converted all citation keys in bib file: ${filePath}`);
		}
	} catch (error) {
		logMessage(`Error converting citation keys in bib file: ${filePath}`, error);
	}
}

function generateUniqueCitationKey(newEntry: bibtexParser.Entry, bibData: bibtexParser.Library): string {
	const newKey = generateFullCitationKey(newEntry);
	const keyExixts = bibData.entries.some((entry) => entry.key === newKey);
	return keyExixts ? "" : newKey;
}

export function addToBibFile(bibString: string | string[], filePath: string) {
	try {
		const bibData = readBibFile(filePath);
		if (bibData) {
			try {
				const newBibData = parseBibLibrary(bibString);
				if (newBibData) {
					newBibData.entries.forEach((newEntry) => {
						const newKey = generateUniqueCitationKey(newEntry, bibData);
						if (newKey) {
							newEntry.input = formatBibEntryInput(newEntry, newKey);
							newEntry.key = newKey;
							bibData.entries.push(newEntry);
						} else {
							logMessage(`Duplicate key: ${newKey}`);
						}
					});
					bibData.entries.sort((a, b) => (a.key.toLocaleLowerCase() < b.key.toLocaleLowerCase() ? -1 : 1));
					if (writeBibFile(bibData, filePath)) {
						const count = newBibData.entries.length;
						if (count) {
							logMessage(`Entries added: ${count}, to bib file: ${filePath}`);
							vscode.window.showInformationMessage(`${count} new ${count > 1 ? "entries" : "entry"} added successfully to bib file: ${filePath}`);
						} else {
							logMessage(`No new entries to add.`);
							vscode.window.showInformationMessage(`No new entries added to bib file: ${filePath}`);
						}
					}
				}
			} catch (error) {
				logMessage(`Error parsing new bib entry: ${bibString}`, error);
			}
		}
	} catch (error) {
		logMessage(`Error adding bib entry to file: ${filePath}`, error);
	}
}
