import * as vscode from "vscode";
import { createFile, getFullPath, openFileInTab } from "../utils/fileUtils";
import { logMessage } from "../extension";

export function openTexFileInTab(arg: any) {
	const fileName = arg["fileName"];

	if (!fileName) {
		vscode.window.showWarningMessage("No filename provided.");
		return;
	}

	logMessage(`Input file is : ${fileName}`);

	const fullPath = getFullPath(fileName);
	if (!fullPath) {
		return;
	}

	if (!createFile(fullPath)) {
		return;
	}

	openFileInTab(fullPath);
}
