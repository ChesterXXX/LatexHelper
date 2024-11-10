import * as vscode from "vscode";
import { applyImportHighlights, removeImportHighlights } from "./decorations/importDecoration";
import { importDocumentLinksProvider } from "./links/importDocumentLinks";
import { openInExternalGraphicsEditor } from "./commands/openInExternalGraphicsEditorCommand";

let importDocumentLinkDisposable: vscode.Disposable | undefined;
let openInExternalGraphicsEditorDisposable: vscode.Disposable | undefined;


function applyImportEffectsIfLatex(document: vscode.TextDocument) {
	const editor = vscode.window.activeTextEditor;
	if (!editor || !document) {
		return;
	}
	if (document.languageId === "latex") {
		applyImportHighlights(editor);

		if (!importDocumentLinkDisposable) {
			importDocumentLinkDisposable = vscode.languages.registerDocumentLinkProvider(
				{ language: "latex" },
				{
					provideDocumentLinks: importDocumentLinksProvider,
				}
			);
		}
		if (!openInExternalGraphicsEditorDisposable) {
			openInExternalGraphicsEditorDisposable = vscode.commands.registerCommand("openInExternalGraphicsEditor", (arg) => openInExternalGraphicsEditor(arg));
		}
	} else {
		importTextDeactivate();
	}
}

export function importTextActivate(context: vscode.ExtensionContext) {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		applyImportEffectsIfLatex(editor.document);
	}

	context.subscriptions.push(
		vscode.workspace.onDidOpenTextDocument(applyImportEffectsIfLatex),
		vscode.workspace.onDidCloseTextDocument(importTextDeactivate),
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

export function importTextDeactivate() {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		removeImportHighlights(editor);
	}
	if (importDocumentLinkDisposable) {
		importDocumentLinkDisposable.dispose();
		importDocumentLinkDisposable = undefined;
	}
	if (openInExternalGraphicsEditorDisposable) {
		openInExternalGraphicsEditorDisposable.dispose();
		openInExternalGraphicsEditorDisposable = undefined;
	}
	console.log("Removed all import effects.");
}