import * as vscode from "vscode";
import { createFile, getFullPath, openFile } from "../utils/fileUtils";

export function openTexFileInTab(arg: any) {
	const fileName = arg["fileName"];

	if (!fileName) {
		vscode.window.showInformationMessage("No filename provided.");
		return;
	}

	console.log(`Input file is : ${fileName}`);

	const fullPath = getFullPath(fileName);
	if (!fullPath) {
		return;
	}

	if (!createFile(fullPath)) {
		return;
	}

	openFile(fullPath);
}
