import * as vscode from "vscode";
import axios from "axios";
import { logMessage } from "../extension";

const BASE_URL = "http://export.arxiv.org/api/query";

// 4783652,2411.01185,2409.02643,4085669,2307.11045,MR0440554

function getCategory(): string{
	return vscode.workspace.getConfiguration("latex-helper").get("arxivCategory", "math");
}

function getBibStringFromArxivEntry(data: string, category: string = ""): string | undefined {
	try {
		const entryMatch = data.match(/<entry>[\s\S]*?<\/entry>/);
		if (!entryMatch) {
			logMessage(`Not a valid entry.`);
			return;
		}

		const entry = entryMatch[0];
		let title = "";
		try {
			const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
			if (!titleMatch) {
				logMessage(`Title is missing`);
			} else {
				title = titleMatch[1].replace(/\n/g, "").trim();
			}
		} catch (error) {
			logMessage(`Error extracting title: ${entry}`, error);
		}

		let authors = "";
		try {
			const authorsMatch = [...entry.matchAll(/<name>(.*?)<\/name>/g)];
			if (!authorsMatch.length) {
				logMessage(`Authors are missing.`);
			} else {
				authors = authorsMatch.map((a) => a[1].trim()).join(" and ");
			}
		} catch (error) {
			logMessage(`Error extracting authors: ${entry}`, error);
		}

		let categoryMatched = false;
		if (category) {
			try {
				const categoriesMatch = [...entry.matchAll(/<category[^>]*term="([^"]*)"/g)];
				if (!categoriesMatch.length) {
					logMessage(`Categories are missing`);
				} else {
					categoryMatched = categoriesMatch.some((match) => match[1].startsWith(category));
				}
			} catch (error) {
				logMessage(`Error extracting categories: ${entry}`, error);
			}
		} else {
			categoryMatched = true;
		}

		let year = "";
		try {
			const yearMatch = entry.match(/<published>(\d{4})/);
			if (!yearMatch) {
				logMessage(`Year is missing`);
			} else {
				year = yearMatch[1];
			}
		} catch (error) {
			logMessage(`Error extracting year: ${entry}`, error);
		}

		let id = "";
		try {
			const idMatch = entry.match(/<id>(.*?)<\/id>/);
			if (!idMatch || !idMatch[1]) {
				logMessage(`ID is missing`);
			} else {
				id = idMatch[1].split("/").pop() || "";
			}
		} catch (error) {
			logMessage(`Error extracting ID: ${entry}`, error);
		}

		if (title && authors && year && id && categoryMatched) {
			return `@article{${id},\n  author = {${authors}},\n  title = {${title}},\n  year = {${year}},\n  url = {https://arxiv.org/abs/${id}}\n}`;
		} else {
			logMessage(`BibTeX entry could not be generated due to missing fields`);
			return;
		}
	} catch (error) {
		logMessage(`Error converting to bib entry: ${data}`, error);
		return;
	}
}

export async function getBibStringArrayByAuthorFromArxiv(author: string): Promise<string[]> {
	const queryURL = `${BASE_URL}?search_query=au:"${author}"&start=0&max_results=100`;
	logMessage(`ArXiV query: ${queryURL}`);
	const bibEntries: string[] = [];
	const category: string = getCategory();

	try {
		const response = await axios.get(queryURL);
		const xmlEntries = [...response.data.matchAll(/<entry>([\s\S]*?)<\/entry>/g)];

		for (const entry of xmlEntries) {
			try {
				const entryData = entry[0];
				const bibString = getBibStringFromArxivEntry(entryData, category);
				if (bibString) {
					bibEntries.push(bibString);
				}
			} catch (error) {
				logMessage(`Could not get bib from entry: ${entry}`, error);
			}
		}
	} catch (error) {
		logMessage(`Error fetching data from ArXiV.`, error);
	}
	return bibEntries;
}

export async function getBibStringArrayByIdsFromArxiv(arxivCodes: string[]) {
	const id_list = arxivCodes.map((x) => x.toLocaleLowerCase().replace(/arxiv:/, "")).join(",");
	const queryURL = `${BASE_URL}?id_list=${id_list}`;
	logMessage(`ArXiV query: ${queryURL}`);
	const bibEntries: string[] = [];
	try {
		const response = await axios.get(queryURL);
		const xmlEntries = [...response.data.matchAll(/<entry>([\s\S]*?)<\/entry>/g)];

		for (const entry of xmlEntries) {
			try {
				const entryData = entry[0];
				const bibString = getBibStringFromArxivEntry(entryData);
				if (bibString) {
					bibEntries.push(bibString);
				}
			} catch (error) {
				logMessage(`Could not get bib from entry: ${entry}`, error);
			}
		}
	} catch (error) {
		logMessage(`Error fetching data from ArXiV.`, error);
	}
	return bibEntries;
}
