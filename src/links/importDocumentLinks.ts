import * as vscode from "vscode";
import * as path from "path";
import { getImports } from "../utils/importRanges";

export function importDocumentLinksProvider(document: vscode.TextDocument): vscode.ProviderResult<vscode.DocumentLink[]> {
	const links: vscode.DocumentLink[] = [];
	const imports = getImports(document);
	imports.forEach((importItem) => {
		if (importItem.isPdfTex) {
			const fileName = path.posix.join(importItem.directory, importItem.filename);
			if (importItem.pdftexRange) {
				const internalEditorArgs = encodeURIComponent(JSON.stringify({ fileName: fileName }));
				const internalEditorLink = new vscode.DocumentLink(importItem.pdftexRange, vscode.Uri.parse(`command:openTexFileInTab?${internalEditorArgs}`));
				internalEditorLink.tooltip = `Open ${importItem.filename} in new tab.`;
				links.push(internalEditorLink);
			}

			const externalEditorArgs = encodeURIComponent(JSON.stringify({ directory: importItem.directory, fileName: importItem.filename }));
			const externalEditorLink = new vscode.DocumentLink(importItem.filenameRange, vscode.Uri.parse(`command:openInExternalGraphicsEditor?${externalEditorArgs}`));
			externalEditorLink.tooltip = `Open ${importItem.filename} in external editor.`;
			links.push(externalEditorLink);
		} else {
			const fileName = path.posix.join(importItem.directory, importItem.filename);
			const args = encodeURIComponent(JSON.stringify({ fileName: fileName }));
			const link = new vscode.DocumentLink(importItem.filenameRange, vscode.Uri.parse(`command:openTexFileInTab?${args}`));
			link.tooltip = `Open ${importItem.filename} in new tab.`;
			links.push(link);
		}
	});

	return links;
}
