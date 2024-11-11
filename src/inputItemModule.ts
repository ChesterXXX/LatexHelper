import * as vscode from "vscode";
import { applyInputHighlights, removeInputHighlights } from "./decorations/inputDecoration";
import { inputDocumentLinksProvider } from "./links/inputDocumentLinks";
import { openTexFileInTab } from "./commands/openTexFileCommand";
import { logMessage } from "./extension";
import { hasLatexFileOpen } from "./utils/fileUtils";

let inputDocumentLinkDisposable: vscode.Disposable | undefined;
let openTexFileInTabDisposable: vscode.Disposable | undefined;

function applyInputEffectsIfLatex(document: vscode.TextDocument) {
	const editor = vscode.window.activeTextEditor;
	if (!editor || !document) {
		return;
	}

	if (hasLatexFileOpen()) {
		applyInputHighlights(editor);

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
		inputTextDeactivate();
	}
}

export function inputTextDeactivate() {
	if (!hasLatexFileOpen()) {
		const editor = vscode.window.activeTextEditor;
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
		logMessage("Removed all input effects.");
	}
}

export function inputTextActivate(context: vscode.ExtensionContext) {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		applyInputEffectsIfLatex(editor.document);
	}

	context.subscriptions.push(
		vscode.workspace.onDidOpenTextDocument(applyInputEffectsIfLatex),
		vscode.workspace.onDidCloseTextDocument(inputTextDeactivate),
		vscode.workspace.onDidChangeTextDocument((event) => {
			if (editor && editor.document === event.document) {
				applyInputEffectsIfLatex(editor.document);
			}
		}),
		vscode.window.onDidChangeActiveTextEditor((editor) => {
			if (editor) {
				applyInputEffectsIfLatex(editor?.document);
			}
		})
		// vscode.window.onDidChangeActiveTextEditor((editor) => {
		// 	if (editor && editor.document.languageId === "latex") {
		// 		applyInputEffectsIfLatex(editor.document);
		// 	} else if (editor) {
		// 		removeInputHighlights(editor);
		// 	}
		// })
	);

	vscode.window.onDidChangeActiveTextEditor((editor) => {
		if (editor) {
			applyInputEffectsIfLatex(editor.document);
		}
	});
	logMessage("Applied input effects.");
}
