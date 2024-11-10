import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { pdfTexWatchers, removeWatcher, setupPdfTexWatcher, setupSVGWatcher, svgWatchers } from "./fileWatchers";
import chokidar from "chokidar";

const cacheFileName = "latex-helper.json";

function getCacheFilePath(): string {
	const workspace = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
	if (workspace) {
		return path.join(workspace, ".vscode", cacheFileName);
	} else {
		return path.join(process.cwd(), cacheFileName);
	}
}

export function getCachedFiles(): string[] {
	const cachePath = getCacheFilePath();
	if (!fs.existsSync(cachePath)) {
		saveCachedFiles([]);
	}
	try {
		const cache = fs.readFileSync(cachePath, "utf-8");
		return JSON.parse(cache);
	} catch (err) {
		console.error("Error reading cache:", err);
		return [];
	}
}

export function checkIfCachedFileExists(filename: string): boolean {
	return fs.existsSync(filename);
}

export function removeCachedFiles(filename: string) {
	const cachedFiles = getCachedFiles();
	const updatedCache = cachedFiles.filter((file) => file !== filename);
	saveCachedFiles(updatedCache);
}

export function watchCachedFiles() {
	const cachedFiles = getCachedFiles();

	cachedFiles.forEach((file) => {
		const svgFilePath = `${file}.svg`;
		const pdftexFilePath = `${file}.pdf_tex`;
		let svgFileExists = false;
		let pdftexFileExists = false;
		if (checkIfCachedFileExists(svgFilePath)) {
			setupSVGWatcher(file);
			svgFileExists = true;
		} else {
            svgFileExists = false;
			removeWatcher(svgWatchers, svgFilePath);
		}

		if (checkIfCachedFileExists(pdftexFilePath)) {
			setupPdfTexWatcher(file);
			pdftexFileExists = true;
		} else {
            pdftexFileExists = false;
			removeWatcher(pdfTexWatchers, pdftexFilePath);
		}

		if (!svgFileExists && !pdftexFileExists) {
			removeCachedFiles(file);
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

function saveCachedFiles(files: string[]) {
	try {
		const cachePath = getCacheFilePath();
		fs.mkdirSync(path.dirname(cachePath), { recursive: true });
		fs.writeFileSync(cachePath, JSON.stringify(files, null, 2), "utf-8");
	} catch (err) {
		console.error("Error writing cache:", err);
	}
}
