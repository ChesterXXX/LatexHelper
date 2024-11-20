import * as vscode from "vscode";
import { inputTextActivate, inputTextDeactivate } from "./inputItemModule";
import { importTextActivate, importTextDeactivate } from "./importItemModule";
import { figureActivate } from "./figureModule";
import { watchCachedFiles } from "./utils/cacheUtils";
import { setupWatchers } from "./utils/fileWatchers";
import { bibFileActivate } from "./bibModule";

const outputChannel = vscode.window.createOutputChannel("LaTeX Helper");


export function logMessage(message: string, error: any=undefined) {
	outputChannel.appendLine(message);
	if(error){
		outputChannel.appendLine(error);
	}
}

export function activate(context: vscode.ExtensionContext) {
	logMessage('The extension "latex-helper" is now active!');

	// Hello world!
	context.subscriptions.push(
		vscode.commands.registerCommand("latex-helper.helloWorld", async () => {
			const userInput = await vscode.window.showInputBox({ prompt: "Enter something" });
			if(userInput){
				logMessage(`Input: ${userInput}`);
				vscode.window.showInformationMessage(`Hello ${userInput}! Welcome to LaTeX Helper!`);
			}
        
		})
	);

	figureActivate(context);
	inputTextActivate(context);
	importTextActivate(context);
	bibFileActivate(context);
	setupWatchers();
	watchCachedFiles();
}

export function deactivate() {
	inputTextDeactivate();
	importTextDeactivate();
}
