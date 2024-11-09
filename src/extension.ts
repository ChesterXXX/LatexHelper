import * as vscode from "vscode";
import { inputHoverProvider, applyInputHighlights, removeInputHighlights } from "./decorations/inputDecoration";
import { inputDocumentLinksProvider } from "./links/inputDocumentLinks";
import { openTexFileInTab } from "./commands/openTexFileCommand";

let inputHoverProviderDisposable: vscode.Disposable | undefined;
let inputDocumentLinkDisposable: vscode.Disposable | undefined;
let openTexFileInTabDisposable: vscode.Disposable | undefined;

function applyInputEffectsIfLatex(document: vscode.TextDocument) {
	const editor = vscode.window.activeTextEditor;
	if (!editor || !document) {
		return;
	}
	if (document.languageId === "latex") {
		applyInputHighlights(editor);

		inputHoverProviderDisposable = vscode.languages.registerHoverProvider(
			{ language: "latex" },
			{
				provideHover: inputHoverProvider,
			}
		);

		inputDocumentLinkDisposable = vscode.languages.registerDocumentLinkProvider(
			{ language: "latex" },
			{
				provideDocumentLinks: inputDocumentLinksProvider,
			}
		);

		openTexFileInTabDisposable = vscode.commands.registerCommand("openTexFileInTab", (arg) => openTexFileInTab(arg));
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
}

export function activate(context: vscode.ExtensionContext) {
	console.log('The extension "latex-helper" is now active!');

	const editor = vscode.window.activeTextEditor;
	if (editor) {
		applyInputEffectsIfLatex(editor.document);
	}

	// Hello world!
	context.subscriptions.push(
		vscode.commands.registerCommand("latex-helper.helloWorld", () => {
			console.log("Hello World!!");
			vscode.window.showInformationMessage("Hello World! Welcome to LaTeX Helper!");
		})
	);

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
}

export function deactivate() {
	removeInputEffects();
}
