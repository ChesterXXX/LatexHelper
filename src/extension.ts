import * as path from "path";
import * as vscode from "vscode";
import { applyInputHighlights, removeInputHighlights } from "./decorations/inputDecoration";
import { inputDocumentLinksProvider } from "./links/inputDocumentLinks";
import { openTexFileInTab } from "./commands/openTexFileCommand";
import { inputHoverProvider } from "./decorations/inputHoverProvider";
import { applyImportHighlights, removeImportHighlights } from "./decorations/importDecoration";
import { importDocumentLinksProvider } from "./links/importDocumentLinks";

let inputHoverProviderDisposable: vscode.Disposable | undefined;
let inputDocumentLinkDisposable: vscode.Disposable | undefined;
let openTexFileInTabDisposable: vscode.Disposable | undefined;

let importHoverProviderDisposable: vscode.Disposable | undefined;
let importDocumentLinkDisposable: vscode.Disposable | undefined;

function applyInputEffectsIfLatex(document: vscode.TextDocument) {
	const editor = vscode.window.activeTextEditor;
	if (!editor || !document) {
		return;
	}
	if (document.languageId === "latex") {
		applyInputHighlights(editor);

		if (!inputHoverProviderDisposable) {
			inputHoverProviderDisposable = vscode.languages.registerHoverProvider(
				{ language: "latex" },
				{
					provideHover: inputHoverProvider,
				}
			);
		}

		if (!inputDocumentLinkDisposable) {
			inputDocumentLinkDisposable = vscode.languages.registerDocumentLinkProvider(
				{ language: "latex" },
				{
					provideDocumentLinks: inputDocumentLinksProvider,
				}
			);
		}
		if (!openTexFileInTabDisposable) {
			openTexFileInTabDisposable = vscode.commands.registerCommand("openTexFileInTab", (arg) => openTexFileInTab(arg));
		}
	} else {
		removeInputEffects();
	}
}

function removeInputEffects() {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		removeInputHighlights(editor);
	}
	if (inputHoverProviderDisposable) {
		inputHoverProviderDisposable.dispose();
		inputHoverProviderDisposable = undefined;
	}
	if (inputDocumentLinkDisposable) {
		inputDocumentLinkDisposable.dispose();
		inputDocumentLinkDisposable = undefined;
	}
	if (openTexFileInTabDisposable) {
		openTexFileInTabDisposable.dispose();
		openTexFileInTabDisposable = undefined;
	}
	console.log("Removed all input effects.");
}

function applyImportEffectsIfLatex(document: vscode.TextDocument) {
	const editor = vscode.window.activeTextEditor;
	if (!editor || !document) {
		return;
	}
	if (document.languageId === "latex") {
		applyImportHighlights(editor);

		// if (!inputHoverProviderDisposable) {
		// 	inputHoverProviderDisposable = vscode.languages.registerHoverProvider(
		// 		{ language: "latex" },
		// 		{
		// 			provideHover: inputHoverProvider,
		// 		}
		// 	);
		// }

		if (!importDocumentLinkDisposable) {
			importDocumentLinkDisposable = vscode.languages.registerDocumentLinkProvider(
				{ language: "latex" },
				{
					provideDocumentLinks: importDocumentLinksProvider,
				}
			);
		}
		// if (!openTexFileInTabDisposable) {
		// 	openTexFileInTabDisposable = vscode.commands.registerCommand("openTexFileInTab", (arg) => openTexFileInTab(arg));
		// }
	} else {
		removeImportEffects();
	}
}

function removeImportEffects() {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		removeImportHighlights(editor);
	}
	// if (inputHoverProviderDisposable) {
	// 	inputHoverProviderDisposable.dispose();
	// 	inputHoverProviderDisposable = undefined;
	// }
	if (importDocumentLinkDisposable) {
		importDocumentLinkDisposable.dispose();
		importDocumentLinkDisposable = undefined;
	}
	// if (openTexFileInTabDisposable) {
	// 	openTexFileInTabDisposable.dispose();
	// 	openTexFileInTabDisposable = undefined;
	// }
	console.log("Removed all import effects.");
}

function inputTextActivation(context: vscode.ExtensionContext) {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		applyInputEffectsIfLatex(editor.document);
	}

	context.subscriptions.push(
		vscode.workspace.onDidOpenTextDocument(applyInputEffectsIfLatex),
		vscode.workspace.onDidCloseTextDocument(removeInputEffects),
		vscode.workspace.onDidChangeTextDocument((event) => {
			const editor = vscode.window.activeTextEditor;
			if (editor && editor.document === event.document) {
				applyInputEffectsIfLatex(editor.document);
			}
		}),
		vscode.window.onDidChangeActiveTextEditor((editor) => {
			if (editor && editor.document.languageId === "latex") {
				applyInputEffectsIfLatex(editor.document);
			} else if (editor) {
				removeInputHighlights(editor);
			}
		})
	);

	vscode.window.onDidChangeActiveTextEditor((editor) => {
		if (editor) {
			applyInputEffectsIfLatex(editor.document);
		}
	});
	console.log("Applied input effects.");
}

function importTextActivation(context: vscode.ExtensionContext) {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		applyImportEffectsIfLatex(editor.document);
	}

	context.subscriptions.push(
		vscode.workspace.onDidOpenTextDocument(applyImportEffectsIfLatex),
		vscode.workspace.onDidCloseTextDocument(removeImportEffects),
		vscode.workspace.onDidChangeTextDocument((event) => {
			const editor = vscode.window.activeTextEditor;
			if (editor && editor.document === event.document) {
				applyImportEffectsIfLatex(editor.document);
			}
		}),
		vscode.window.onDidChangeActiveTextEditor((editor) => {
			if (editor && editor.document.languageId === "latex") {
				applyImportEffectsIfLatex(editor.document);
			} else if (editor) {
				removeImportHighlights(editor);
			}
		})
	);

	vscode.window.onDidChangeActiveTextEditor((editor) => {
		if (editor) {
			applyImportEffectsIfLatex(editor.document);
		}
	});
	console.log("Applied import effects.");
}

function figureActivation(context: vscode.ExtensionContext) {
	// let figureName = "";
	let figureNameRecorder: vscode.Disposable | undefined;
	let isRecording = false;
	let startPos: vscode.Position | undefined = undefined;
	let endPos: vscode.Position | undefined = undefined;

	const figureTrigger = "@";

	const figureTriggerListener = vscode.workspace.onDidChangeTextDocument((event) => {
		const editor = vscode.window.activeTextEditor;
		if (editor && event.document === editor.document) {
			const change = event.contentChanges[0];

			if (change && change.text === figureTrigger) {
				if (isRecording) {
					endPos = editor.selection.active;
					if (startPos && endPos) {
						replaceTextInRange(startPos, endPos);
						startPos = undefined;
						endPos = undefined;
					}
					figureNameRecorder?.dispose();
				}
				isRecording = true;
				startPos = editor.selection.active;
				endPos = undefined;
				attachFigureNameRecorderListener();
			}
		}
	});

	function attachFigureNameRecorderListener() {
		figureNameRecorder = vscode.workspace.onDidChangeTextDocument((event) => {
			const editor = vscode.window.activeTextEditor;
			if (editor && event.document === editor.document) {
				const change = event.contentChanges[0];

				if (change && /\s/.test(change.text)) {
					isRecording = false;
					if (startPos) {
						endPos = editor.selection.active;
						replaceTextInRange(startPos, endPos);
						startPos = undefined;
						endPos = undefined;
					}
					figureNameRecorder?.dispose();
				}
			}
		});
	}

	function processFilename(recordedPath: string): { dir: string; filename: string } {
		let dirPath = path.dirname(recordedPath);
		let filename = path.basename(recordedPath);

		if (dirPath.startsWith("/")) {
			dirPath = `.${dirPath}`;
		} else if (dirPath !== ".") {
			dirPath = `./${dirPath}`;
		}

		return { dir: dirPath, filename: filename };
	}

	function getReplacementString(startPos: vscode.Position, endPos: vscode.Position, figureName: string, editor: vscode.TextEditor) {
		let replacementString = `\\begin{figure}[h]
	\\def\\svgwidth{\${1:#mul}\\columnwidth}
	\\import{#dir}{#filename.pdf_tex}
	\\label{fig:\${2:#filename}}
	\\caption{\${3:Some Figure}}
\\end{figure}`;
		const lineNumber = startPos.line;
		const lineText = editor.document.lineAt(lineNumber).text;
		const indentationLength = lineText.search(/\S|$/);
		const isAtStartOfLine = startPos.character === indentationLength;

		if (!isAtStartOfLine) {
			replacementString = `\n${replacementString}`;
		}

		const { dir, filename } = processFilename(figureName);
		replacementString = replacementString.replaceAll("#mul", "0.5");
		replacementString = replacementString.replaceAll("#dir", dir);
		replacementString = replacementString.replaceAll("#filename", filename);

		const replacementLines = replacementString.split("\n");

		for (let i = 1; i < replacementLines.length; i++) {
			replacementLines[i] = " ".repeat(indentationLength) + replacementLines[i];
		}

		const finalReplacementString = replacementLines.join("\n");

		return finalReplacementString;
	}

	function replaceTextInRange(startPos: vscode.Position, endPos: vscode.Position) {
		const editor = vscode.window.activeTextEditor;
		if (editor && startPos.isBefore(endPos)) {
			const range = new vscode.Range(startPos, endPos);
			let figureName = editor.document.getText(range).trim().substring(1);
			vscode.window.showInformationMessage(`Figure name : ${figureName}`);
			if (/\s/.test(figureName)) {
				vscode.window.showWarningMessage(`Figure name should not contains whitespace.`);
				return;
			}

			let replacementString = getReplacementString(startPos, endPos, figureName, editor);

			const snippet = new vscode.SnippetString(replacementString);

			editor.insertSnippet(snippet, range).then(() => {
				vscode.window.showInformationMessage(`Text replaced with the formatted string.`);
			});
		}
	}

	context.subscriptions.push(figureTriggerListener);
}

export function activate(context: vscode.ExtensionContext) {
	console.log('The extension "latex-helper" is now active!');

	// Hello world!
	context.subscriptions.push(
		vscode.commands.registerCommand("latex-helper.helloWorld", () => {
			console.log("Hello World!!");
			vscode.window.showInformationMessage("Hello World! Welcome to LaTeX Helper!");
		})
	);
	inputTextActivation(context);
	importTextActivation(context);
	figureActivation(context);
}

export function deactivate() {
	removeInputEffects();
}
