import * as fs from "fs";
import { addPdfTexToWatchlist, addSvgToWatchlist, removePdfTexFromWatchlist, removeSvgFromWatchlist } from "./fileWatchersChokidar";
import { logMessage } from "../extension";
import { getLocalConfigFileWatchList, setLocalConfigFileWatchList } from "./localConfigUtils";

export function watchCachedFiles() {
	const cachedFiles = getLocalConfigFileWatchList();
	if (!cachedFiles) {
		logMessage("Invalid cached watchlist");
		return;
	}

	logMessage(`Cached file watchlist:\n${cachedFiles.join("\n")}`);

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
			addPdfTexToWatchlist(imageFullPath, true);
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
	const cachedFiles = getLocalConfigFileWatchList();
	if (!cachedFiles) {
		logMessage("Invalid cached watchlist");
		return;
	}
	if (!cachedFiles.includes(filename)) {
		cachedFiles.push(filename);
		setLocalConfigFileWatchList(cachedFiles);
	}
}

export function removeCachedFiles(filename: string) {
	const cachedFiles = getLocalConfigFileWatchList();
	if (!cachedFiles) {
		logMessage("Invalid cached watchlist");
		return;
	}
	const updatedCache = cachedFiles.filter((file) => file !== filename);
	setLocalConfigFileWatchList(updatedCache);
}
