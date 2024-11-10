import * as vscode from "vscode";

export function getInputs(document: vscode.TextDocument){
    const inputRegex = /\\input\{([^}]+)\}/g;
    const inputs: {filename: string, range: vscode.Range}[] = [];
    const l = '\\input{'.length;
	
    let match;
	while ((match = inputRegex.exec(document.getText())) !== null) {
		const startPos = document.positionAt(match.index + l);
		const endPos = document.positionAt(match.index + l + match[1].length);
        const filename = match[1];
        const range = new vscode.Range(startPos, endPos);
        inputs.push({filename: filename, range});
	}
	return inputs;
}