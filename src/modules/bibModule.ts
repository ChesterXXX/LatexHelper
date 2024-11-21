import * as vscode from "vscode";
import * as bibtexParser from "@retorquere/bibtex-parser";
import { logMessage } from "../extension";
import { addToBibFile, checkBibFileForDuplicateKeys, convertCitationKeys, sortBibFileByKey } from "../utils/bibUtils";
import { getBibStringArrayByIdsFromArxiv } from "./arxivSubmodule";
import { getBibStringByIdsFromMathSciNet } from "./mathscinetSubmodule";
import { activateFuse, assertFuseActiveBeforeSearch, fuzzySplitQuerySearch } from "./fuzzySubmodule";

function registerCommands(context: vscode.ExtensionContext) {
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
		}),
		vscode.commands.registerCommand("latex-helper.searchMasterBibFiles", async () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				return;
			}
			const isFuseActive = await assertFuseActiveBeforeSearch();
			if (!isFuseActive) {
				return;
			}

			try {
				const searchBox = vscode.window.createQuickPick();
				searchBox.placeholder = "Fuzzy search bib entries by key, author and title";
				searchBox.ignoreFocusOut = true;
				searchBox.matchOnDescription = true;
				searchBox.matchOnDetail = true;
				searchBox.canSelectMany = true;

				let debounceTimeout: NodeJS.Timeout | null = null;
				const doubouncedSearch = (query: string) => {
					if (debounceTimeout) {
						clearTimeout(debounceTimeout);
					}
					debounceTimeout = setTimeout(async () => {
						const results = fuzzySplitQuerySearch(query);
						logMessage(`Found results after fuzzy search: ${results.length}`);
						const searchBoxItems = results.map((item) => ({
							label: item.key,
							description: item.fields.title,
							detail: item.input,
							alwaysShow: true,
						}));
						searchBox.items = searchBoxItems;
					}, 300);
				};
				searchBox.onDidChangeValue((query) => {
					doubouncedSearch(query);
				});

				searchBox.onDidAccept(() => {
					const selectedItems = searchBox.selectedItems;
					const itemCount = selectedItems.length;
					if (itemCount > 0) {
						const filePath = editor.document.uri.fsPath;
						logMessage(`${itemCount} item${itemCount > 1 ? "s" : ""} selected to add to the bib file: ${filePath}`);
						const bibString = selectedItems.map(item => item.detail).join('\n');
						addToBibFile(bibString, filePath);
					}
					searchBox.hide();
				});
				searchBox.onDidHide(() => {
					searchBox.dispose();
				});

				searchBox.show();
			} catch (error) {
				vscode.window.showErrorMessage(`An error occurred: ${error}`);
			}
		})
	);
}

export function bibFileActivate(context: vscode.ExtensionContext) {
	registerCommands(context);
	activateFuse();
}
