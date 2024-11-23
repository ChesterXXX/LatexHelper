import * as vscode from "vscode";
import * as bibtexParser from "@retorquere/bibtex-parser";
import * as fs from "fs";
import { logMessage } from "../extension";
import { generateCitationKey } from "./citationKeyUtils";
import { removeAccents, sanitizeString } from "./textUtils";

function autosortBibFileByKey(): boolean {
	return vscode.workspace.getConfiguration("latex-helper").get<boolean>("autosortBibFile", true);
}

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
	const regex = /([A-Za-z0-9\-]+)\s*=\s*{([^}]+)}/g;
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

function generateUniqueCitationKey(newEntry: bibtexParser.Entry, bibData: bibtexParser.Library): string | undefined {
	const newKey = generateCitationKey(newEntry);
	const keyExixts = bibData.entries.some((entry) => entry.key === newKey);
	if (keyExixts) {
		const oldKey = newEntry.key;
		const oldKeyExists = bibData.entries.some((entry) => entry.key === oldKey);
		if (oldKeyExists) {
			logMessage(`Duplicate entry exists: ${oldKey}`);
		} else {
			return oldKey;
		}
	} else {
		return newKey;
	}
}

function processEntries(newEntries: bibtexParser.Entry[], bibData: bibtexParser.Library) {
	const validEntries: bibtexParser.Entry[] = [];
	const duplicateEntries: bibtexParser.Entry[] = [];

	newEntries.forEach((newEntry) => {
		const newKey = generateCitationKey(newEntry);
		newEntry.input = formatBibEntryInput(newEntry, newKey);
		newEntry.key = newKey;
		const keyExixts = bibData.entries.some((entry) => entry.key === newKey);
		if (keyExixts) {
			duplicateEntries.push(newEntry);
		} else {
			validEntries.push(newEntry);
		}
	});

	return { validEntries, duplicateEntries };
}

async function handleDuplicateEntries(duplicateEntries: bibtexParser.Entry[], bibData: bibtexParser.Library): Promise<number> {
	let duplicateCount = duplicateEntries.length;
	if (duplicateCount > 0) {
		const quickPick = vscode.window.createQuickPick();
		quickPick.placeholder = "Select duplicate entries to add";
		quickPick.canSelectMany = true;
		quickPick.items = duplicateEntries.map((entry) => ({
			label: entry.key,
			description: entry.fields.title,
			detail: entry.input,
			alwaysShow: true,
		}));

		quickPick.onDidAccept(() => {
			const selectedItems = quickPick.selectedItems.map((item) => item.detail);
			if (selectedItems.length > 0) {
				const selectedEntries = duplicateEntries.filter((entry) => selectedItems.includes(entry.input));
				duplicateCount = selectedEntries.length;

				bibData.entries.push(...selectedEntries);
				logMessage(`Added ${selectedEntries.length} duplicate entries.`);
			} else {
				logMessage("No duplicate entry added.");
			}
			quickPick.hide();
		});

		quickPick.show();

		await new Promise<void>((resolve) => {
			quickPick.onDidHide(() => {
				quickPick.dispose();
				resolve();
			});
		});
	}
	return duplicateCount;
}

export async function addToBibFile(bibString: string | string[], filePath: string) {
	try {
		const bibData = readBibFile(filePath);
		if (!bibData) {
			logMessage(`Could not read the bib file: ${filePath}`);
			return;
		}

		const newBibData = parseBibLibrary(bibString);
		if (!newBibData) {
			logMessage(`Error parsing new bib entry: ${bibString}`);
			return;
		}

		const { validEntries, duplicateEntries } = processEntries(newBibData.entries, bibData);

		let count = validEntries.length;

		if (count > 0) {
			bibData.entries.push(...validEntries);
		}

		const duplicateCount = await handleDuplicateEntries(duplicateEntries, bibData);

		if (duplicateCount > 0) {
			count += duplicateCount;
		}

		if (autosortBibFileByKey()) {
			bibData.entries.sort((a, b) => a.key.toLocaleLowerCase().localeCompare(b.key.toLocaleLowerCase()));
		}

		writeBibFile(bibData, filePath);
		if (count > 0) {
			logMessage(`Total entry added: ${count}, to bib file: ${filePath}`);
			vscode.window.showInformationMessage(`Total ${count} new ${count > 1 ? "entries" : "entry"} added successfully to bib file: ${filePath}`);
		} else {
			logMessage(`No new entries to add.`);
			vscode.window.showInformationMessage(`No new entries added to bib file: ${filePath}`);
		}
	} catch (error) {
		logMessage(`Error adding bib entry to file: ${filePath}`, error);
	}
}

export async function sortBibFileByKey(filePath: string) {
	try {
		const bibData = readBibFile(filePath);
		if (bibData) {
			const response = await vscode.window.showInformationMessage("Sorting the bib file might break it as it depends on the parser. Are you sure?", { modal: true }, "Yes", "No");
			if (response === "Yes") {
				bibData.entries.sort((a, b) => (a.key.toLocaleLowerCase() < b.key.toLocaleLowerCase() ? -1 : 1));
				if (writeBibFile(bibData, filePath)) {
					logMessage(`Sorted the bib file by citation keys: ${filePath}`);
					vscode.window.showInformationMessage(`Sorted the bib file by citation keys: ${filePath}`);
				} else {
					logMessage(`Error writing sorted bib data to file: ${filePath}`);
				}
			} else {
				logMessage(`Canceled sorting: ${filePath}`);
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

export async function convertCitationKeys(filePath: string) {
	try {
		const bibData = readBibFile(filePath);
		if (bibData && bibData.entries && bibData.entries.length > 0) {
			const response = await vscode.window.showWarningMessage("Converting the citation keys might break your project! Are you sure?", "Yes", "No");
			if (response === "Yes") {
				logMessage(`Detected entries before formatting: ${bibData.entries.length}`);
				let modifiedBibStr = "";
				bibData.entries.forEach((entry) => {
					const newKey = generateCitationKey(entry);
					modifiedBibStr += formatBibEntryInput(entry, newKey) + "\n";
				});
				const modifiedBibData = bibtexParser.parse(modifiedBibStr);
				logMessage(`Entries after formatting: ${modifiedBibData.entries.length}`);
				if (autosortBibFileByKey()) {
					modifiedBibData.entries.sort((a, b) => (a.key.toLocaleLowerCase() < b.key.toLocaleLowerCase() ? -1 : 1));
				}
				writeBibFile(modifiedBibData, filePath);
				logMessage(`Converted all citation keys in bib file: ${filePath}`);
			} else {
				logMessage(`Canceled converting: ${filePath}`);
			}
		}
	} catch (error) {
		logMessage(`Error converting citation keys in bib file: ${filePath}`, error);
	}
}

export function getMasterBibData(): bibtexParser.Entry[] {
	const masterBibFiles = vscode.workspace.getConfiguration("latex-helper").get<string[]>("masterBibFiles", []);
	const bibEntries: bibtexParser.Entry[] = [];
	masterBibFiles.forEach((filePath) => {
		const bibData = readBibFile(filePath);
		if (bibData) {
			bibData.entries.forEach((bibEntry) => bibEntries.push(bibEntry));
		}
	});
	return bibEntries;
}

export function getBibItemForFuzzySearch(bib: bibtexParser.Entry, path: string) {
	if (path === "title") {
		return sanitizeString(bib.fields.title || "");
	} else if (path === "key") {
		return bib.key;
	} else if (path === "authors") {
		const authors: bibtexParser.Creator[] = bib.fields.author || bib.fields.bookauthor || [];
		return authors
			.map((author) => {
				const authorName = `${author.firstName} ${author.lastName}`.trim() || author.name || "";
				return removeAccents(authorName);
			})
			.join(", ");
	} else {
		return "";
	}
}
