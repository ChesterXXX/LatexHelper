import * as vscode from "vscode";

export function inputHoverProvider(document: vscode.TextDocument, position: vscode.Position) {
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