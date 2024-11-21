import * as vscode from "vscode";
import { applyInputHighlights, removeInputHighlights } from "../decorations/inputDecoration";
import { inputDocumentLinksProvider } from "../links/inputDocumentLinks";
import { openTexFileInTab } from "../commands/openTexFileCommand";
import { logMessage } from "../extension";
import { hasLatexFileOpen } from "../utils/fileUtils";

let inputDocumentLinkDisposable: vscode.Disposable | undefined;
let openTexFileInTabDisposable: vscode.Disposable | undefined;

function setInputEffectsActivated(context: vscode.ExtensionContext, state: boolean) {
	context.globalState.update("inputEffectsActivated", state);
}

function getInputEffectsActivated(context: vscode.ExtensionContext): boolean {
	return context.globalState.get("inputEffectsActivated", false);
}

function applyInputEffectsIfLatex(document: vscode.TextDocument, inputEffectsActivated: boolean): boolean {
	const editor = vscode.window.activeTextEditor;

	if (!editor || !document) {
		return inputEffectsActivated;
	}

	if (hasLatexFileOpen()) {
		applyInputHighlights(editor);
		if (inputEffectsActivated) {
			return inputEffectsActivated;
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
		inputEffectsActivated = true;
	} else {
		inputEffectsActivated = inputTextDeactivate(inputEffectsActivated);
	}
	return inputEffectsActivated;
}

export function inputTextActivate(context: vscode.ExtensionContext) {
	const editor = vscode.window.activeTextEditor;
	setInputEffectsActivated(context, false);

	if (editor) {
		let inputEffectsActivated = getInputEffectsActivated(context);
		inputEffectsActivated = applyInputEffectsIfLatex(editor.document, inputEffectsActivated);
		setInputEffectsActivated(context, inputEffectsActivated);
	}

	context.subscriptions.push(
		vscode.workspace.onDidOpenTextDocument((document: vscode.TextDocument) => {
			let inputEffectsActivated = getInputEffectsActivated(context);
			inputEffectsActivated = applyInputEffectsIfLatex(document, inputEffectsActivated);
			setInputEffectsActivated(context, inputEffectsActivated);
		}),
		vscode.workspace.onDidCloseTextDocument(() => {
			let inputEffectsActivated = getInputEffectsActivated(context);
			inputEffectsActivated = inputTextDeactivate(inputEffectsActivated);
			setInputEffectsActivated(context, inputEffectsActivated);
		}),
		vscode.workspace.onDidChangeTextDocument((event) => {
			if (editor && editor.document === event.document) {
				let inputEffectsActivated = false;
				inputEffectsActivated = applyInputEffectsIfLatex(editor.document, inputEffectsActivated);
				setInputEffectsActivated(context, inputEffectsActivated);
			}
		}),
		vscode.window.onDidChangeActiveTextEditor((editor) => {
			if (editor) {
				let inputEffectsActivated = getInputEffectsActivated(context);
				inputEffectsActivated = applyInputEffectsIfLatex(editor.document, inputEffectsActivated);
				setInputEffectsActivated(context, inputEffectsActivated);
			}
		})
	);

	vscode.window.onDidChangeActiveTextEditor((editor) => {
		if (editor) {
			let inputEffectsActivated = getInputEffectsActivated(context);
			inputEffectsActivated = applyInputEffectsIfLatex(editor.document, inputEffectsActivated);
			setInputEffectsActivated(context, inputEffectsActivated);
		}
	});

	logMessage("Applied input effects.");
}

export function inputTextDeactivate(inputEffectsActivated: boolean = true): boolean {
	const editor = vscode.window.activeTextEditor;
	if (!hasLatexFileOpen()) {
		if (!inputEffectsActivated) {
			return inputEffectsActivated;
		}
		if (editor) {
			removeInputHighlights(editor);
		}
		if (inputDocumentLinkDisposable) {
			inputDocumentLinkDisposable.dispose();
			inputDocumentLinkDisposable = undefined;
		}
		if (openTexFileInTabDisposable) {
			openTexFileInTabDisposable.dispose();
			openTexFileInTabDisposable = undefined;
		}
		logMessage("Removed all input link effects.");
		inputEffectsActivated = false;
	}
	return inputEffectsActivated;
}
