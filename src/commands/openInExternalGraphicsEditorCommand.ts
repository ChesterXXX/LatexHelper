import * as vscode from "vscode";
import { createFile, getFullPath, openFile } from "../utils/fileUtils";
import path from "path";

export function openInExternalGraphicsEditor(arg: any) {
    const directory = arg["directory"];

	if (!directory) {
		vscode.window.showInformationMessage("No directory provided.");
		return;
	}

	const fileName = arg["fileName"];

	if (!fileName) {
		vscode.window.showInformationMessage("No filename provided.");
		return;
	}

    const filePath = path.join(directory, fileName);
	console.log(`Import file is : ${filePath}`);

	const fullPath = getFullPath(fileName);

	if (!fullPath) {
		return;
	}

	// if (!createFile(fullPath)) {
	// 	return;
	// }

	// openFile(fullPath);
}
