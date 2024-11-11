import * as vscode from "vscode";
import { inputTextActivate, inputTextDeactivate } from "./inputItemModule";
import { importTextActivate, importTextDeactivate } from "./importItemModule";
import { figureActivation } from "./figureModule";
import { watchCachedFiles } from "./utils/cacheUtils";

const outputChannel = vscode.window.createOutputChannel("LaTeX Helper");

export function logMessage(message:string){
	outputChannel.appendLine(message);
}

export function activate(context: vscode.ExtensionContext) {
	logMessage('The extension "latex-helper" is now active!');
	
	// Hello world!
	context.subscriptions.push(
		vscode.commands.registerCommand("latex-helper.helloWorld", () => {
			logMessage("Hello World!!");
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
