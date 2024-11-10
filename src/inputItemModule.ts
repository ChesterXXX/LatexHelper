import * as vscode from "vscode";
import { applyInputHighlights, removeInputHighlights } from "./decorations/inputDecoration";
import { inputDocumentLinksProvider } from "./links/inputDocumentLinks";
import { openTexFileInTab } from "./commands/openTexFileCommand";
// import { inputHoverProvider } from "./decorations/inputHoverProvider";


// let inputHoverProviderDisposable: vscode.Disposable | undefined;
let inputDocumentLinkDisposable: vscode.Disposable | undefined;
let openTexFileInTabDisposable: vscode.Disposable | undefined;


function applyInputEffectsIfLatex(document: vscode.TextDocument) {
	const editor = vscode.window.activeTextEditor;
	if (!editor || !document) {
		return;
	}
	if (document.languageId === "latex") {
		applyInputHighlights(editor);

		// if (!inputHoverProviderDisposable) {
		// 	inputHoverProviderDisposable = vscode.languages.registerHoverProvider(
		// 		{ language: "latex" },
		// 		{
		// 			provideHover: inputHoverProvider,
		// 		}
		// 	);
		// }

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
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		removeInputHighlights(editor);
	}
	// if (inputHoverProviderDisposable) {
	// 	inputHoverProviderDisposable.dispose();
	// 	inputHoverProviderDisposable = undefined;
	// }
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


export function inputTextActivate(context: vscode.ExtensionContext) {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		applyInputEffectsIfLatex(editor.document);
	}

	context.subscriptions.push(
		vscode.workspace.onDidOpenTextDocument(applyInputEffectsIfLatex),
		vscode.workspace.onDidCloseTextDocument(inputTextDeactivate),
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
