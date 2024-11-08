import * as vscode from "vscode";
import { applyHover, highlightInputs } from "./decorations/inputDecoration";
import { provideDocumentLinks } from "./links/inputDocumentLinks";
import { openTexFileInTab } from "./commands/openTexFileCommand";

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "latex-helper" is now active!');

	// Hello world!
	context.subscriptions.push(
		vscode.commands.registerCommand("latex-helper.helloWorld", () => {
			console.log("Hello World!!");
			vscode.window.showInformationMessage("Hello World! Welcome to LaTeX Helper!");
		})
	);

	// Apply some decoration to \input{filename} on any text change
	vscode.workspace.onDidChangeTextDocument((event) => {
		const editor = vscode.window.activeTextEditor;
		if (editor && event.document === editor.document) {
			highlightInputs(editor);
		}
	});

	// Apply some decoration to \input{filename} on switching to a new tab
	vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor) {
            highlightInputs(editor);
        }
    });

	// Apply some decoration to \input{filename} on opening a new file
    if (vscode.window.activeTextEditor) {
        highlightInputs(vscode.window.activeTextEditor);
    }

	// Add a hover text to \input{filename}
	vscode.languages.registerHoverProvider("*", {
		provideHover: applyHover,
	});

	// Make each \input{filename} into a link
	context.subscriptions.push(
		vscode.languages.registerDocumentLinkProvider("*", {
			provideDocumentLinks: provideDocumentLinks,
		})
	);

	// Create a filename.tex if necessary, and open it in a new tab (or switch to existing tab)
	vscode.commands.registerCommand("openTexFileInTab", (arg) => openTexFileInTab(arg));
}

export function deactivate() {}
