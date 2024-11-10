import * as vscode from "vscode";
import * as chokidar from "chokidar";
import { exportPdfTex } from "./inkscapeUtils";
import { watchCachedFiles } from "./cacheUtils";

export const svgWatchers: chokidar.FSWatcher[] = [];
export const pdfTexWatchers: chokidar.FSWatcher[] = [];

export function setupSVGWatcher(imageFullPath: string) {
	const svgFilePath: string = `${imageFullPath}.svg`;

	const isAlreadyWatched = svgWatchers.some((watcher) => {
		return watcher.getWatched()[svgFilePath] !== undefined;
	});

	if (!isAlreadyWatched) {
		const svgWatcher = chokidar.watch(svgFilePath, { persistent: true });
		svgWatchers.push(svgWatcher);

		svgWatcher
			.on("change", () => {
				console.log(`SVG file changed : ${svgFilePath}`);
				exportPdfTex(imageFullPath);
				setupPdfTexWatcher(imageFullPath);
			})
			.on("unlink", () => {
				console.log(`SVG file deleted: ${svgFilePath}`);
				watchCachedFiles();
			});
	}
}

export function setupPdfTexWatcher(imageFullPath: string) {
	const pdftexFilePath = `${imageFullPath}.pdf_tex`;

	const isAlreadyWatched = pdfTexWatchers.some((watcher) => {
		return watcher.getWatched()[pdftexFilePath] !== undefined;
	});

	if (!isAlreadyWatched) {
		const pdfTexWatcher = chokidar.watch(pdftexFilePath, { persistent: true });
		pdfTexWatchers.push(pdfTexWatcher);

		pdfTexWatcher
			.on("change", () => {
				console.log(`pdf_tex file changed : ${pdftexFilePath}`);
				vscode.window.showInformationMessage(`pdf_tex file has been updated : ${pdftexFilePath}`);
			})
			.on("unlink", () => {
				console.log(`pdf_tex file deleted: ${pdftexFilePath}`);
				watchCachedFiles();
			});
	}
}

export function removeWatcher(watcherArray: chokidar.FSWatcher[], filePath: string) {
	const watcherIndex = watcherArray.findIndex((watcher) => {
		return watcher.getWatched()[filePath] !== undefined;
	});

	if (watcherIndex !== -1) {
		watcherArray[watcherIndex].close();
		watcherArray.splice(watcherIndex, 1);
	}
}
