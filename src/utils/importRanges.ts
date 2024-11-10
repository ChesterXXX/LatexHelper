import * as vscode from "vscode";

export function getImports(document: vscode.TextDocument) {
	const inputRegex = /\\import\{([^}]+)\}\{([^}]+)\}/g;
	const imports: { directory: string; filename: string; dirRange: vscode.Range; filenameRange: vscode.Range; isPdfTex: boolean }[] = [];
	const dirOffset = "\\import{".length;

	let match;
	while ((match = inputRegex.exec(document.getText())) !== null) {
		const dirStartPos = document.positionAt(match.index + dirOffset);
		const dirEndPos = document.positionAt(match.index + dirOffset + match[1].length);
		const filenameOffset = dirOffset + match[1].length + 2;
		const filenameStartPos = document.positionAt(match.index + filenameOffset);
		const filenameEndPos = document.positionAt(match.index + filenameOffset + match[2].length);

		const directory = match[1];
		const filename = match[2];
		const isPdfTex = filename.endsWith(".pdf_tex");

		const dirRange = new vscode.Range(dirStartPos, dirEndPos);
		const filenameRange = new vscode.Range(filenameStartPos, filenameEndPos);

		imports.push({ directory, filename, dirRange, filenameRange, isPdfTex });
	}
	return imports;
}
