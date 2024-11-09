import * as vscode from "vscode";

export function getInputs(document: vscode.TextDocument){
    const inputRegex = /\\input\{([^}]+)\}/g;
    const inputs: {word: string, range: vscode.Range}[] = [];
    const l = '\\input{'.length;
	
    let match;
	while ((match = inputRegex.exec(document.getText())) !== null) {
		const startPos = document.positionAt(match.index + l);
		const endPos = document.positionAt(match.index + l + match[1].length);
        const word = match[1];
        const range = new vscode.Range(startPos, endPos);
        inputs.push({word, range});
	}
	return inputs;
}