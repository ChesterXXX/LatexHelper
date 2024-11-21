import * as vscode from "vscode";
import { applyImportHighlights, removeImportHighlights } from "./decorations/importDecoration";
import { importDocumentLinksProvider } from "./links/importDocumentLinks";
import { openInExternalGraphicsEditor } from "./commands/openInExternalGraphicsEditorCommand";
import { logMessage } from "./extension";
import { hasLatexFileOpen } from "./utils/fileUtils";

let importDocumentLinkDisposable: vscode.Disposable | undefined;
let openInExternalGraphicsEditorDisposable: vscode.Disposable | undefined;

function setImportEffectsActivated(context: vscode.ExtensionContext, state: boolean) {
	context.globalState.update("importEffectsActivated", state);
}

function getImportEffectsActivated(context: vscode.ExtensionContext): boolean {
	return context.globalState.get("importEffectsActivated", false);
}

function applyImportEffectsIfLatex(document: vscode.TextDocument, importEffectsActivated: boolean): boolean {
	const editor = vscode.window.activeTextEditor;

	if (!editor || !document) {
		return importEffectsActivated;
	}

	if (hasLatexFileOpen()) {
		if (importEffectsActivated) {
			return importEffectsActivated;
		}
		
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

		importEffectsActivated = true;
	} else {
		importEffectsActivated = importTextDeactivate(importEffectsActivated);
	}

	return importEffectsActivated;
}

export function importTextActivate(context: vscode.ExtensionContext) {
	const editor = vscode.window.activeTextEditor;
	setImportEffectsActivated(context, false);

	if (editor) {
		let importEffectsActivated = getImportEffectsActivated(context);
		importEffectsActivated = applyImportEffectsIfLatex(editor.document, importEffectsActivated);
		setImportEffectsActivated(context, importEffectsActivated);
	}

	context.subscriptions.push(
		vscode.workspace.onDidOpenTextDocument((document: vscode.TextDocument) => {
			let importEffectsActivated = getImportEffectsActivated(context);
			importEffectsActivated = applyImportEffectsIfLatex(document, importEffectsActivated);
			setImportEffectsActivated(context, importEffectsActivated);
		}),
		vscode.workspace.onDidCloseTextDocument(() => {
			let importEffectsActivated = getImportEffectsActivated(context);
			importEffectsActivated = importTextDeactivate(importEffectsActivated);
			setImportEffectsActivated(context, importEffectsActivated);
		}),
		vscode.workspace.onDidChangeTextDocument((event) => {
			if (editor && editor.document === event.document) {
				let importEffectsActivated = false; // Since the decoration range always changes.
				importEffectsActivated = applyImportEffectsIfLatex(editor.document, importEffectsActivated);
				setImportEffectsActivated(context, importEffectsActivated);
			}
		}),
		vscode.window.onDidChangeActiveTextEditor((editor) => {
			if (editor) {
				let importEffectsActivated = getImportEffectsActivated(context);
				importEffectsActivated = applyImportEffectsIfLatex(editor.document, importEffectsActivated);
				setImportEffectsActivated(context, importEffectsActivated);
			}
		})
	);

	vscode.window.onDidChangeActiveTextEditor((editor) => {
		if (editor) {
			let importEffectsActivated = getImportEffectsActivated(context);
			importEffectsActivated = applyImportEffectsIfLatex(editor.document, importEffectsActivated);
			setImportEffectsActivated(context, importEffectsActivated);
		}
	});

	logMessage("Applied import effects.");
}

export function importTextDeactivate(importEffectsActivated: boolean = true): boolean {
	const editor = vscode.window.activeTextEditor;
	if (!hasLatexFileOpen()) {
		if (!importEffectsActivated) {
			return importEffectsActivated;
		}
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
		logMessage("Removed all import link effects.");
		importEffectsActivated = false;
	}
	return importEffectsActivated;
}
