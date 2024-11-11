import * as vscode from "vscode";
import { createFile, createSVGFile, getFullPath, openFileInTab } from "../utils/fileUtils";
import path from "path";
import { addSvgToWatchlist } from "../utils/fileWatchers";
import { openInInkscape } from "../utils/inkscapeUtils";
import { addCachedFiles } from "../utils/cacheUtils";

export function openInExternalGraphicsEditor(arg: any) {
	const directory = arg["directory"];
	if (!directory) {
		vscode.window.showWarningMessage("No directory provided.");
		return;
	}

	const pdftexFileName = arg["fileName"];
	if (!pdftexFileName) {
		vscode.window.showWarningMessage("No filename provided.");
		return;
	}

	const pdftexFilePath = path.posix.join(directory, pdftexFileName);
	const pdftexFullPath = getFullPath(pdftexFilePath);

	if (!pdftexFullPath) {
		return;
	}

	const imageFullPath = pdftexFullPath.slice(0, -".pdf_tex".length);

	if (!imageFullPath) {
		return;
	}

	if (!createSVGFile(imageFullPath)) {
		return;
	}

	addCachedFiles(imageFullPath);

	addSvgToWatchlist(imageFullPath);

	openInInkscape(imageFullPath);
}
