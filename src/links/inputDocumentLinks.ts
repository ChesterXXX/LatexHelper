import * as vscode from "vscode";
import * as path from "path";
import { getInputs } from "../utils/inputRanges";

export function inputDocumentLinksProvider(document: vscode.TextDocument): vscode.ProviderResult<vscode.DocumentLink[]> {
	const links: vscode.DocumentLink[] = [];
	const inputs = getInputs(document);
	inputs.forEach((input) => {
        const args = encodeURIComponent(JSON.stringify({ fileName: input.word }));
        const link = new vscode.DocumentLink(input.range, vscode.Uri.parse(`command:openTexFileInTab?${args}`));
		links.push(link);
    });
	
	return links;
}
