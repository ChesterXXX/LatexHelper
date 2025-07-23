import * as vscode from "vscode";
import { inputTextActivate, inputTextDeactivate } from "./modules/inputItemModule";
import { importTextActivate, importTextDeactivate } from "./modules/importItemModule";
import { figureSnippetActivate, figureSnippetDeactivate } from "./modules/figureModule";
import { watchCachedFiles } from "./utils/cacheUtils";
import { setupWatchersChokidar } from "./utils/fileWatchersChokidar";
import { bibFileActivate } from "./modules/bibModule";
import { activateFuse } from "./modules/fuzzySubmodule";
import { disposeWatchersVSCodeAPI, setupWatchersVSCodeAPI } from "./utils/fileWatchersVSCodeAPI";

const outputChannel = vscode.window.createOutputChannel("LaTeX Helper");

export function logMessage(message: string, error: any = undefined) {
	outputChannel.appendLine(message);
	if (error) {
		outputChannel.appendLine(error);
	}
}

function isFigureSnippetAcitvated(): boolean {
	return vscode.workspace.getConfiguration("latex-helper").get<boolean>("figureSnippetActivated", false);
}

function isChokidarUsed(): boolean {
	return vscode.workspace.getConfiguration("latex-helper").get<boolean>("useChokidar", false);
}

export function activate(context: vscode.ExtensionContext) {
	logMessage('The extension "latex-helper" is now active!');

	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration((e) => {
			if (e.affectsConfiguration("latex-helper.figureSnippetActivated")) {
				if (isFigureSnippetAcitvated()) {
					figureSnippetActivate(context);
				} else {
					figureSnippetDeactivate();
				}
			}
			if (e.affectsConfiguration("latex-helper.masterBibFiles")) {
				activateFuse();
			}
			if (e.affectsConfiguration("latex-helper.useChokidar")) {
				if (isChokidarUsed()) {
					setupWatchersChokidar();
					watchCachedFiles();
				} else {
					setupWatchersVSCodeAPI(context);
				}
			}
		})
	);

	inputTextActivate(context);
	importTextActivate(context);
	if (isChokidarUsed()) {
		setupWatchersChokidar();
		watchCachedFiles();
	} else {
		setupWatchersVSCodeAPI(context);
	}
	if (isFigureSnippetAcitvated()) {
		figureSnippetActivate(context);
	}
	bibFileActivate(context);
}

export function deactivate() {
	inputTextDeactivate();
	importTextDeactivate();
	if (isFigureSnippetAcitvated()) {
		figureSnippetDeactivate();
	}
	if (!isChokidarUsed()) {
		disposeWatchersVSCodeAPI();
	}
}
