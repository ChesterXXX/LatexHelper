import * as vscode from "vscode";

export function getImports(document: vscode.TextDocument) {
	const importRegex = /\\import\{([^}]+)\}\{([^}]+)\}/g;
	const imports: { directory: string; filename: string; dirRange: vscode.Range; filenameRange: vscode.Range; isPdfTex: boolean; pdftexRange: vscode.Range | undefined }[] = [];
	const dirOffset = "\\import{".length;

	let match;
	while ((match = importRegex.exec(document.getText())) !== null) {
		const directory = match[1];
		const filename = match[2];
		const isPdfTex = filename.endsWith(".pdf_tex");

		const dirStartPos = document.positionAt(match.index + dirOffset);
		const dirEndPos = document.positionAt(match.index + dirOffset + directory.length);
		const filenameOffset = dirOffset + directory.length + 2;

		const filenameStartPos = document.positionAt(match.index + filenameOffset);

		let filenameEndPos: vscode.Position;
		let pdftexStartPos: vscode.Position | undefined;
		let pdftexEndPos: vscode.Position | undefined;
		let pdftexRange: vscode.Range | undefined;

		if (!isPdfTex) {
			filenameEndPos = document.positionAt(match.index + filenameOffset + filename.length);
		} else {
			const pdftexLen = ".pdf_tex".length;
			filenameEndPos = document.positionAt(match.index + filenameOffset + filename.length - pdftexLen);
			pdftexStartPos = document.positionAt(match.index + filenameOffset + filename.length - pdftexLen + 1);
			pdftexEndPos = document.positionAt(match.index + filenameOffset + filename.length);
			pdftexRange = new vscode.Range(pdftexStartPos, pdftexEndPos);
		}

		const dirRange = new vscode.Range(dirStartPos, dirEndPos);
		const filenameRange = new vscode.Range(filenameStartPos, filenameEndPos);

		imports.push({ directory, filename, dirRange, filenameRange, isPdfTex, pdftexRange });
	}
	return imports;
}
