import axios from "axios";
import { logMessage } from "./extension";
import * as vscode from "vscode";

//const query = https://mathscinet.ams.org/mathscinet/api/publications/format?formats=bib&ids=4783652

const BASE_URL = "https://mathscinet.ams.org/mathscinet/api/publications/format?formats=bib&ids=";

export async function getBibStringByIdsFromMathSciNet(mrCodes: string[]): Promise<string[]> {
	const id_list = mrCodes.map((x) => x.toLocaleLowerCase().replace(/mr/, "")).join(",");
	const queryURL = `${BASE_URL}${id_list}`;
	logMessage(`MathSciNet query: ${queryURL}`);
	const bibEntries: string[] = [];
	try {
		const response = await axios.get(queryURL);
		if (Array.isArray(response.data)) {
			response.data.forEach((entry) => {
				const bibEntry = entry.bib;
				if (bibEntry) {
					bibEntries.push(bibEntry);
				} else {
					logMessage(`No BibTeX entry found for one of paper IDs: ${id_list}`);
				}
			});
		}
	} catch (error) {
		logMessage(`Error fetching data for paper ID: ${id_list}`, error);
		vscode.window.showWarningMessage(`Could not retrieve from MathSciNet. Make sure you have access.`);
	}
	return bibEntries;
}
