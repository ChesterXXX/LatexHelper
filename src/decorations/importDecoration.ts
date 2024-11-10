import * as vscode from "vscode";
import { getImports } from "../utils/importRanges";

let importDirectoryDecoration: vscode.TextEditorDecorationType | undefined;
let importFilenameDecoration: vscode.TextEditorDecorationType | undefined;
let importPdfTexExtensionDecoration: vscode.TextEditorDecorationType | undefined;

function setImportDecorations() {
	const config = vscode.workspace.getConfiguration("latex-helper");
	const directoryColor = config.get("importDirectoryTextHighlightColor", "DarkGreen");
	const filenameColor = config.get("importFilenameTextHighlightColor", "DarkRed");
	const extensionColor = config.get("importPdfTexTextHighlightColor", "Crimson");
	if (importDirectoryDecoration) {
		importDirectoryDecoration.dispose();
	}
	importDirectoryDecoration = vscode.window.createTextEditorDecorationType({
		color: directoryColor,
		fontStyle: "italic",
		// textDecoration: "underline",
	});

	if (importFilenameDecoration) {
		importFilenameDecoration.dispose();
	}
	importFilenameDecoration = vscode.window.createTextEditorDecorationType({
		color: filenameColor,
		fontStyle: "italic",
		// textDecoration: "underline",
	});

	if (importPdfTexExtensionDecoration){
		importPdfTexExtensionDecoration.dispose();
	}
	importPdfTexExtensionDecoration = vscode.window.createTextEditorDecorationType({
		color: extensionColor,
		fontStyle: "italic",
		// textDecoration: "underline",
	});
}

function getImportDecorationRanges(document: vscode.TextDocument) {
	const directoryDecorations: vscode.DecorationOptions[] = [];
	const filenameDecorations: vscode.DecorationOptions[] = [];
	const extensionDecorations: vscode.DecorationOptions[] = [];
	const imports = getImports(document);

	imports.forEach((importItem) => {
		const directoryDecoration: vscode.DecorationOptions = {
			range: importItem.dirRange,
		};
		const filenameDecoration: vscode.DecorationOptions = {
			range: importItem.filenameRange,
		};
		directoryDecorations.push(directoryDecoration);
		filenameDecorations.push(filenameDecoration);
		if(importItem.isPdfTex && importItem.pdftexRange){
			const extensionDecoration: vscode.DecorationOptions = {
				range: importItem.pdftexRange,
			};
			extensionDecorations.push(extensionDecoration);
		}
	});

	return { directoryDecorations: directoryDecorations, filenameDecorations: filenameDecorations, extensionDecorations: extensionDecorations };
}

export function applyImportHighlights(editor: vscode.TextEditor) {
	const document = editor.document;

	const decorations = getImportDecorationRanges(document);
	setImportDecorations();
	if (decorations.directoryDecorations.length > 0 && importDirectoryDecoration) {
		editor.setDecorations(importDirectoryDecoration, decorations.directoryDecorations);
	}
	if (decorations.filenameDecorations.length > 0 && importFilenameDecoration) {
		editor.setDecorations(importFilenameDecoration, decorations.filenameDecorations);
	}
	if (decorations.extensionDecorations.length > 0 && importPdfTexExtensionDecoration) {
		editor.setDecorations(importPdfTexExtensionDecoration, decorations.extensionDecorations);
	}
}

export function removeImportHighlights(editor: vscode.TextEditor) {
	console.log("Removed all import decorations.");
	setImportDecorations();
	if (importDirectoryDecoration) {
		editor.setDecorations(importDirectoryDecoration, []);
		importDirectoryDecoration.dispose();
		importDirectoryDecoration = undefined;
	}
	if (importFilenameDecoration) {
		editor.setDecorations(importFilenameDecoration, []);
		importFilenameDecoration.dispose();
		importFilenameDecoration = undefined;
	}
	if (importPdfTexExtensionDecoration) {
		editor.setDecorations(importPdfTexExtensionDecoration, []);
		importPdfTexExtensionDecoration.dispose();
		importPdfTexExtensionDecoration = undefined;
	}
}
