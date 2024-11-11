import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { addPdfTexToWatchlist, addSvgToWatchlist, removePdfTexFromWatchlist, removeSvgFromWatchlist } from "./fileWatchers";
import { logMessage } from "../extension";

const cacheFileName = "latex-helper.json";

function isWorkspaceAvailable(): boolean {
	return vscode.workspace.workspaceFolders !== undefined;
}

function getCacheFilePath(): string {
	let filePath: string;

	if (isWorkspaceAvailable()) {
		const workspaceFolder = vscode.workspace.workspaceFolders![0].uri.fsPath;
		const vscodeFolderPath = path.join(workspaceFolder, ".vscode");
		filePath = path.join(vscodeFolderPath, cacheFileName);

		if (!fs.existsSync(vscodeFolderPath)) {
			fs.mkdirSync(vscodeFolderPath, { recursive: true });
		}
	} else {
		filePath = `${process.cwd()}/${cacheFileName}`;
	}

	if (!fs.existsSync(filePath)) {
		fs.writeFileSync(filePath, "[]", "utf-8");
		logMessage(`Created empty cache file: ${filePath}`);
	}

	return filePath;
}

function getFileWatchlist(): string[] {
	const filePath = getCacheFilePath();
	const fileData = fs.readFileSync(filePath, "utf-8");

	try {
		const watchlist = JSON.parse(fileData);
		if (Array.isArray(watchlist)) {
			return watchlist;
		} else {
			vscode.window.showWarningMessage("The cached data is not valid.");
			return [];
		}
	} catch (error) {
		vscode.window.showErrorMessage(`Error parsing JSON from cache file: ${error}`);
		return [];
	}
}

export function watchCachedFiles() {
	const cachedFiles = getFileWatchlist();

	logMessage(`Cached watchlist:\n${cachedFiles}`);

	cachedFiles.forEach((imageFullPath) => {
		const svgFilePath = `${imageFullPath}.svg`;
		const pdftexFilePath = `${imageFullPath}.pdf_tex`;
		let svgFileExists = false;
		let pdftexFileExists = false;

		if (fs.existsSync(svgFilePath)) {
			addSvgToWatchlist(imageFullPath);
			svgFileExists = true;
		} else {
			removeSvgFromWatchlist(imageFullPath);
			svgFileExists = false;
		}

		if (fs.existsSync(pdftexFilePath)) {
			addPdfTexToWatchlist(imageFullPath);
			pdftexFileExists = true;
		} else {
			removePdfTexFromWatchlist(imageFullPath);
			pdftexFileExists = false;
		}

		if (!svgFileExists && !pdftexFileExists) {
			removeCachedFiles(imageFullPath);
		}
	});
}

export function addCachedFiles(filename: string) {
	const cachedFiles = getFileWatchlist();
	if (!cachedFiles.includes(filename)) {
		cachedFiles.push(filename);
		saveCachedFiles(cachedFiles);
	}
}

export function removeCachedFiles(filename: string) {
	const cachedFiles = getFileWatchlist();
	const updatedCache = cachedFiles.filter((file) => file !== filename);
	saveCachedFiles(updatedCache);
}

function saveCachedFiles(files: string[]): void {
	const cachePath = getCacheFilePath();
	try {
		const jsonData = JSON.stringify(files, null, 2);
		fs.writeFileSync(cachePath, jsonData, "utf-8");
		logMessage("Saved files to watch in cache.");
	} catch (error) {
		vscode.window.showErrorMessage(`Error saving cached files: ${error}`);
	}
}
