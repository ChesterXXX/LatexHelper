import * as vscode from "vscode";
import * as bibtexParser from "@retorquere/bibtex-parser";
import { logMessage } from "../extension";
import { getMasterBibData, getBibItemForFuzzySearch } from "../utils/bibUtils";

let fuse: any = null;

const options = {
	includeScore: true,
	keys: [
		{ name: "key", weight: 0.3 },
		{ name: "authors", weight: 0.5 },
		{ name: "title", weight: 0.2 },
	],
	threshold: 0.1,
	getFn: (obj: any, path: any) => {
		const bib: bibtexParser.Entry = obj as bibtexParser.Entry;
		if (Array.isArray(path)) {
			return path.map((p) => getBibItemForFuzzySearch(bib, p)).join("\n");
		} else {
			return getBibItemForFuzzySearch(bib, path);
		}
	},
	tokenize: true,
	matchAllTokens: true,
};

async function inializeFuse(bibEntries: bibtexParser.Entry[]) {
	const Fuse = (await import("fuse.js")).default;
	fuse = new Fuse(bibEntries, options);
}

export function activateFuse() {
	const bibEntries = getMasterBibData();
	if (bibEntries.length > 0) {
		inializeFuse(bibEntries)
			.then(() => {
				logMessage("Fuse activated.");
				// logMessage(fuse._docs.length);
			})
			.catch((error) => {
				logMessage("Error activating Fuse.", error);
			});
	}
}

export async function assertFuseActiveBeforeSearch(): Promise<boolean> {
	if (fuse === null || fuse === undefined) {
		const bibEntries = getMasterBibData();
		if (bibEntries.length > 0) {
			try {
				await inializeFuse(bibEntries);
				logMessage("Intialized fuse before search.");
				return true;
			} catch (error) {
				logMessage("Error activating fuse before search", error);
				return false;
			}
		} else {
			logMessage(`No master bib entries found.`);
			vscode.window.showWarningMessage("Setup at least one master bib file via the setting `latex-helper.masterBibFiles`.");
			return false;
		}
	} else {
		return true;
	}
}

export function fuzzySplitQuerySearch(query: string): bibtexParser.Entry[] {
	const terms = query.split(/\s+/);
	const results = terms.filter(item => item.trim()).map((term) => fuse.search(term.trim()));

	const matchingEntries = results.reduce(
		(intersection, termResults) => {
			const termItems = new Set<bibtexParser.Entry>(termResults.map((result: { item: bibtexParser.Entry }) => result.item as bibtexParser.Entry));
			return intersection.filter((entry: bibtexParser.Entry) => termItems.has(entry));
		},
		results[0].map((result: { item: bibtexParser.Entry }) => result.item as bibtexParser.Entry)
	);
	return matchingEntries;
}

// let debounceTimeout: NodeJS.Timeout | null = null;

// export function searchWithDebounce(query: string) {
// 	if (debounceTimeout) {
// 		clearTimeout(debounceTimeout);
// 	}
// 	debounceTimeout = setTimeout(async () => {
// 		const results = await fuzzySplitQuerySearch(query);
// 		console.log(results);
// 	}, 300);
// }
