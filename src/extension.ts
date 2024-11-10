import * as vscode from "vscode";
import { inputTextActivate, inputTextDeactivate } from "./inputItemModule";
import { importTextActivate, importTextDeactivate } from "./importItemModule";
import { figureActivation } from "./figureModule";
import { watchCachedFiles } from "./utils/cacheUtils";

export function activate(context: vscode.ExtensionContext) {
	console.log('The extension "latex-helper" is now active!');
	
	// Hello world!
	context.subscriptions.push(
		vscode.commands.registerCommand("latex-helper.helloWorld", () => {
			console.log("Hello World!!");
			vscode.window.showInformationMessage("Hello World! Welcome to LaTeX Helper!");
		})
	);

	figureActivation(context);
	inputTextActivate(context);
	importTextActivate(context);
	watchCachedFiles();
}

export function deactivate() {
	inputTextDeactivate();
	importTextDeactivate();
}
