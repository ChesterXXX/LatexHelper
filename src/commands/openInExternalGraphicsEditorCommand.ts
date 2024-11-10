import * as vscode from "vscode";
import { createFile, createSVGFile, getFullPath, openFileInTab } from "../utils/fileUtils";
import path from "path";

export function openInExternalGraphicsEditor(arg: any) {
    const directory = arg["directory"];

	if (!directory) {
		vscode.window.showWarningMessage("No directory provided.");
		return;
	}

	const fileName = arg["fileName"];

	if (!fileName) {
		vscode.window.showWarningMessage("No filename provided.");
		return;
	}

	const imageName = path.basename(fileName, '.pdf_tex');

	const svgFilename = `${imageName}.svg`;

    const svgPath = path.posix.join(directory, svgFilename);
	console.log(`Import SVG is : ${svgPath}`);

	const svgFullPath = getFullPath(svgPath);
	console.log(`SVG file is ${svgFullPath}`);
	if (!svgFullPath) {
		return;
	}

	if (!createSVGFile(svgFullPath)) {
		return;
	}

}
