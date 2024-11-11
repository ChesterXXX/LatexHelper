import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { addPdfTexToWatchlist, addSvgToWatchlist, removePdfTexFromWatchlist, removeSvgFromWatchlist } from "./fileWatchers";

const cacheFileName = "latex-helper.json";

function isWorkspaceAvailable(): boolean {
	return vscode.workspace.workspaceFolders !== undefined;
}

function getCacheFilePath(): string {
	return path.join(process.cwd(), cacheFileName);
}

export function getCachedFiles(): string[] {
	if (isWorkspaceAvailable()) {
		const workspaceConfig = vscode.workspace.getConfiguration();
		return workspaceConfig.get<string[]>("latex-helper", []);
	} else {
		const cachePath = getCacheFilePath();
		if (!fs.existsSync(cachePath)) {
			saveCachedFiles([]);
		}
		try {
			const cache = fs.readFileSync(cachePath, "utf-8");
			return JSON.parse(cache);
		} catch (err) {
			vscode.window.showErrorMessage(`Error reading watchlist from cache: ${err}`);
			return [];
		}
	}
}

export function watchCachedFiles() {
	const cachedFiles = getCachedFiles();

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
	const cachedFiles = getCachedFiles();
	if (!cachedFiles.includes(filename)) {
		cachedFiles.push(filename);
		saveCachedFiles(cachedFiles);
	}
}

export function removeCachedFiles(filename: string) {
	const cachedFiles = getCachedFiles();
	const updatedCache = cachedFiles.filter((file) => file !== filename);
	saveCachedFiles(updatedCache);
}

function saveCachedFiles(files: string[]) {
	try {
		if (isWorkspaceAvailable()) {
			const workspaceConfig = vscode.workspace.getConfiguration();
			workspaceConfig.update("latex-helper", files, vscode.ConfigurationTarget.Workspace);
		} else {
			const cachePath = getCacheFilePath();
			fs.mkdirSync(path.dirname(cachePath), { recursive: true });
			fs.writeFileSync(cachePath, JSON.stringify(files, null, 2), "utf-8");
		}
	} catch (err) {
		vscode.window.showErrorMessage(`Error writing watchlist to cache: ${err}`);
	}
}
