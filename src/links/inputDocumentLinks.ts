import * as vscode from "vscode";
import * as path from "path";
import { getInputs } from "../utils/inputRanges";

export function inputDocumentLinksProvider(document: vscode.TextDocument): vscode.ProviderResult<vscode.DocumentLink[]> {
	const links: vscode.DocumentLink[] = [];
	const inputs = getInputs(document);
	inputs.forEach((inputItem) => {
        const args = encodeURIComponent(JSON.stringify({ fileName: inputItem.filename }));
        const link = new vscode.DocumentLink(inputItem.range, vscode.Uri.parse(`command:openTexFileInTab?${args}`));
		link.tooltip = `Open ${inputItem.filename} in new tab.`;
		links.push(link);
    });
	
	return links;
}
