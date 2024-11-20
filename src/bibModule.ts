import * as vscode from "vscode";
import { logMessage } from "./extension";
import { addToBibFile, checkBibFileForDuplicateKeys, convertCitationKeys, sortBibFileByKey } from "./utils/bibUtils";
import { getBibStringArrayByAuthorFromArxiv } from "./arxivSubmodule";

export function bibFileActivation(context: vscode.ExtensionContext) {
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
		vscode.commands.registerCommand("latex-helper.addToBibFile", async () => {
			const editor = vscode.window.activeTextEditor;

			if (editor) {
				const filePath = editor.document.uri.fsPath;
				logMessage(`Bib file path to add entries to: ${filePath}`);
				const userInput = await vscode.window.showInputBox({ prompt: "Enter MR code, arxiv code, or author name." });
				if (userInput) {
					logMessage(`User input: ${userInput}`);
					const bibStringData = await getBibStringArrayByAuthorFromArxiv(userInput.trim());
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
