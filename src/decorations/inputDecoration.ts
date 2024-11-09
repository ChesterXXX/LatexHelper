import * as vscode from "vscode";

// const inputDecoration = vscode.window.createTextEditorDecorationType({
// 	color: "red",
// 	fontStyle: "italic",
// 	textDecoration: "underline",
// });

function getInputDecoration() {
	const config = vscode.workspace.getConfiguration("latex-helper");
	const color = config.get("inputTextHighlightColor", "DodgerBlue");
	const inputDecoration = vscode.window.createTextEditorDecorationType({
		color: color,
		fontStyle: "italic",
		textDecoration: "underline",
	});
	return inputDecoration;
}

export function highlightInputs(editor: vscode.TextEditor) {
	const document = editor.document;
	const inputRegex = /\\input\{([^}]+)\}/g;
	const decorations: vscode.DecorationOptions[] = [];
	let match;
	while ((match = inputRegex.exec(document.getText())) !== null) {
		const startPos = document.positionAt(match.index + 7);
		const endPos = document.positionAt(match.index + 7 + match[1].length);
		const decoration: vscode.DecorationOptions = {
			range: new vscode.Range(startPos, endPos),
		};
		decorations.push(decoration);
	}
	if (decorations.length > 0) {
		const inputDecoration = getInputDecoration();
		editor.setDecorations(inputDecoration, decorations);
	}
}

export function applyHover(document: vscode.TextDocument, position: vscode.Position) {
	const range = document.getWordRangeAtPosition(position, /\\input{([^}]*)}/);
	if (range) {
		const wordMathces = document.getText(range).match(/\\input{([^}]*)}/);
		if (wordMathces) {
			const word = wordMathces[1].trim();
			console.log(`Input is : ${word}`);
			return new vscode.Hover(`Open in new tab : ${word}`);
		}
	}
	return undefined;
}
