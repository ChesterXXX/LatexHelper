import * as vscode from "vscode";
import * as path from "path";
import { getImports } from "../utils/importRanges";

export function importDocumentLinksProvider(document: vscode.TextDocument): vscode.ProviderResult<vscode.DocumentLink[]> {
	const links: vscode.DocumentLink[] = [];
	const imports = getImports(document);
	imports.forEach((importItem) => {
        if (importItem.isPdfTex) {
            const args = encodeURIComponent(JSON.stringify({ directory: importItem.directory, fileName: importItem.filename }));
			const link = new vscode.DocumentLink(importItem.filenameRange, vscode.Uri.parse(`command:openInExternalGraphicsEditor?${args}`));
			links.push(link);
		} else {
            const fileName = path.posix.join(importItem.directory, importItem.filename);
            const args = encodeURIComponent(JSON.stringify({ fileName: fileName }));
            const link = new vscode.DocumentLink(importItem.filenameRange, vscode.Uri.parse(`command:openTexFileInTab?${args}`));
			links.push(link);
        }
	});

	return links;
}
