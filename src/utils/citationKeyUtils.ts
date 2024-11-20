import * as vscode from "vscode";
import * as bibtexParser from "@retorquere/bibtex-parser";
import { logMessage } from "../extension";

function getWordsCutoff(): number {
	const config = vscode.workspace.getConfiguration("latex-helper");
	return config.get<number>("wordsCutoff", 5);
}

function getAuthorsCutoff(): number {
	const config = vscode.workspace.getConfiguration("latex-helper");
	return config.get<number>("authorCutoff", 3);
}

function getReplacements(): { [key: string]: string } {
	return vscode.workspace.getConfiguration("latex-helper").get<{ [key: string]: string }>("replacements")!;
}

function getCommonWords(): string[] {
	return vscode.workspace.getConfiguration("latex-helper").get<string[]>("commonWords")!;
}

function sanitizeString(input: string): string {
	let sanitized = input.normalize("NFD");

	sanitized = sanitized.replace(/[\u0300-\u036f]/g, "");

	sanitized = sanitized.replace(/[^a-zA-Z0-9]/g, "");

	return sanitized;
}

function generateCitationKeyFromTitle(title: string): string {
	title = title
		.replace(/\$[^$]*\$/g, " ")
		.replace(/<[^>]*>/g, " ")
		.replace(/&[^;]*;/g, " ")
		.replace(/[^\w\s-]/g, " ");
	const commonWords = getCommonWords();
	const wordsCutoff = getWordsCutoff();
	const words = title.split(/[\s-_]+/).filter((word) => !commonWords.includes(word.toLowerCase()));
	const updatedWords = words.map((word) => {
		let newWord = word;
		const replacements = getReplacements();
		for (const search in replacements) {
			if (replacements.hasOwnProperty(search) && word.toLowerCase().startsWith(search.toLowerCase())) {
				newWord = replacements[search];
				break;
			}
		}
		return newWord.charAt(0).toUpperCase() + newWord.slice(1).toLowerCase();
	});
	const titleKey = updatedWords.slice(0, wordsCutoff).join("");
	return sanitizeString(titleKey);
}

function generateCitationKeyFromAuthors(authors: bibtexParser.Creator[]) {
	const lastNames = authors.map((author) => {
		const lastName = author.lastName || author.firstName || author.name || undefined;
		if (lastName) {
			return sanitizeString(lastName);
		} else {
			return "";
		}
	});
	return lastNames.join("");
}

function generateCitationKeyAuthorsTitle(entry: bibtexParser.Entry) {
	const title = entry.fields.title;
	const authors = entry.fields.author || entry.fields.bookauthor || undefined;
	let titleKey = "";
	if (title) {
		titleKey = generateCitationKeyFromTitle(title);
	}
	let authorKey = "";
	if (authors) {
		authorKey = generateCitationKeyFromAuthors(authors);
	}
	const newKey = `${authorKey}_${titleKey}`;
	if (newKey) {
		return newKey;
	} else {
		return entry.key;
	}
}

function generateShortCitationKeyFromAuthors(authors: bibtexParser.Creator[]) {
	const authorCutoff = getAuthorsCutoff();
	const lastNames = authors.map((author) => {
		const lastName = author.lastName || author.firstName || author.name || undefined;
		if (lastName) {
			const sanitizedLastName = sanitizeString(lastName);
			const match = sanitizedLastName.match(/.*(?=[A-Z])/);
			if (match) {
				const splitIndex = match[0].length;
				return sanitizedLastName.substring(splitIndex).slice(0, authorCutoff);
			}
			return sanitizedLastName.slice(0, authorCutoff);
		} else {
			return "";
		}
	});
	return lastNames.join("");
}

function generateCitationKeyAuthorsYear(entry: bibtexParser.Entry) {
	const authors = entry.fields.author || entry.fields.bookauthor || undefined;
	let authorKey = "";
	if (authors) {
		authorKey = generateShortCitationKeyFromAuthors(authors);
	}
	const year = entry.fields.year;
	let yearKey = "";
	if (year) {
		yearKey = year;
	}
	const newKey = `${authorKey}${yearKey}`;
	if (newKey) {
		return newKey;
	} else {
		return entry.key;
	}
}

function generateCitationKeyDefault(entry: bibtexParser.Entry) {
	return "";
}

export function generateCitationKey(entry: bibtexParser.Entry): string {
	const config = vscode.workspace.getConfiguration();
	const citationKeyFormat = config.get<string>("latex-helper.citationKeyFormat", "Default");

	switch (citationKeyFormat) {
		case "AuthorsYear":
			return generateCitationKeyAuthorsYear(entry);
		case "Authors_Title":
			return generateCitationKeyAuthorsTitle(entry);
		default:
			return generateCitationKeyDefault(entry);
	}
}
