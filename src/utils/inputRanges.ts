import * as vscode from "vscode";

export function getInputs(document: vscode.TextDocument) {
	const inputRegex = /\\input\{([^}]+)\}/g;
	const inputs: { filename: string; range: vscode.Range }[] = [];
	const inputLength = "\\input{".length;

	let match;
	while ((match = inputRegex.exec(document.getText())) !== null) {
		const filename = match[1];
		const startPos = document.positionAt(match.index + inputLength);
		const endPos = document.positionAt(match.index + inputLength + filename.length);
		const range = new vscode.Range(startPos, endPos);
		inputs.push({ filename: filename, range });
	}
	return inputs;
}
