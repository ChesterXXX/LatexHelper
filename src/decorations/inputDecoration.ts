import * as vscode from "vscode";
import { getInputs } from "../utils/inputRanges";

let inputDecoration: vscode.TextEditorDecorationType | undefined;

function setInputDecoration() {
	const config = vscode.workspace.getConfiguration("latex-helper");
	const color = config.get("inputTextHighlightColor", "DodgerBlue");
	if (inputDecoration) {
		inputDecoration.dispose();
	}
	inputDecoration = vscode.window.createTextEditorDecorationType({
		color: color,
		fontStyle: "italic",
		textDecoration: "underline",
	});
}

function getInputDecorationRanges(document: vscode.TextDocument) {
	const decorations: vscode.DecorationOptions[] = [];
	const inputs = getInputs(document);
	inputs.forEach((input) => {
		const decoration: vscode.DecorationOptions = {
			range: input.range,
		};
		decorations.push(decoration);
	});

	return decorations;
}

export function applyInputHighlights(editor: vscode.TextEditor) {
	const document = editor.document;

	const decorations = getInputDecorationRanges(document);
	setInputDecoration();
	if (decorations.length > 0 && inputDecoration) {
		editor.setDecorations(inputDecoration, decorations);
	}
}

export function removeInputHighlights(editor: vscode.TextEditor) {
	console.log("Removed all decorations.");
	setInputDecoration();
	if (inputDecoration) {
		editor.setDecorations(inputDecoration, []);
		inputDecoration.dispose();
		inputDecoration = undefined;
	}
}

