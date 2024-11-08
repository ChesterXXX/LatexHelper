import * as vscode from 'vscode';
import * as path from 'path';

export function provideDocumentLinks(document: vscode.TextDocument): vscode.ProviderResult<vscode.DocumentLink[]> {
    const links: vscode.DocumentLink[] = [];
    const text = document.getText();
    const regex = /\\input{([^}]+)}/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
        const startPos = document.positionAt(match.index + 7);
        const endPos = document.positionAt(match.index + 7 + match[1].length);
        const range = new vscode.Range(startPos, endPos);
        const args = { fileName: match[1] };
        const link = new vscode.DocumentLink(range, vscode.Uri.parse(`command:openTexFileInTab?${encodeURIComponent(JSON.stringify(args))}`));
        links.push(link);
    }
    return links;
}