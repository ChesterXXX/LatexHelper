import * as vscode from "vscode";
import { logMessage } from "./extension";
import { addToBibFile, checkBibFileForDuplicateKeys, convertCitationKeys, sortBibFileByKey } from "./utils/bibUtils";
import { getBibStringArrayByAuthorFromArxiv, getBibStringArrayByIdsFromArxiv } from "./arxivSubmodule";
import { getBibStringByIdsFromMathSciNet } from "./mathscinetSubmodule";

export function bibFileActivate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand("latex-helper.sortBibFileByCitationKey", () => {
			const editor = vscode.window.activeTextEditor;

			if (editor) {
				const filePath = editor.document.uri.fsPath;
				logMessage(`Bib file path for sorting: ${filePath}`);
				sortBibFileByKey(filePath);
			} else {
				vscode.window.showInformationMessage("No bib file is open.");
			}
		}),
		vscode.commands.registerCommand("latex-helper.checkBibFileForDuplicateKeys", () => {
			const editor = vscode.window.activeTextEditor;

			if (editor) {
				const filePath = editor.document.uri.fsPath;
				logMessage(`Bib file path for checking duplicate keys: ${filePath}`);
				checkBibFileForDuplicateKeys(filePath);
			} else {
				vscode.window.showInformationMessage("No bib file is open.");
			}
		}),
		vscode.commands.registerCommand("latex-helper.convertCitationKeys", () => {
			const editor = vscode.window.activeTextEditor;

			if (editor) {
				const filePath = editor.document.uri.fsPath;
				logMessage(`Bib file path for converting citation keys: ${filePath}`);
				convertCitationKeys(filePath);
			} else {
				vscode.window.showInformationMessage("No bib file is open.");
			}
		}),
		vscode.commands.registerCommand("latex-helper.addToBibFileByIDs", async () => {
			// 4783652,2411.01185,2409.02643,4085669,2307.11045,MR0440554
			const editor = vscode.window.activeTextEditor;
			
			if (editor) {
				const filePath = editor.document.uri.fsPath;
				logMessage(`Bib file path to add entries to: ${filePath}`);
				const userInput = await vscode.window.showInputBox({ prompt: "Enter comma-separated list of MathScieNet and ArXiV codes." });
				if (userInput) {
					logMessage(`User input: ${userInput}`);
					const codes = userInput.split(",").map((x) => x.trim());
					const mrCodes = codes.filter((x) => x.toLocaleLowerCase().match(/^(mr)?\d+$/));
					const arxivCodes = codes.filter((x) => x.toLocaleLowerCase().match(/^(arxiv:)?\d+\.\d+$/));
					const [bibStringDataArxiv, bibStringDataMathscinet] = await Promise.all([getBibStringArrayByIdsFromArxiv(arxivCodes), getBibStringByIdsFromMathSciNet(mrCodes)]);
					const bibStringData = bibStringDataArxiv.concat(bibStringDataMathscinet);
					addToBibFile(bibStringData, filePath);
				} else {
					logMessage(`No input provided.`);
				}
			} else {
				vscode.window.showInformationMessage("No bib file is open.");
			}
		})
	);
}
