import * as chokidar from "chokidar";
import * as vscode from "vscode";
import { logMessage } from "../extension";
import { watchCachedFiles } from "./cacheUtils";
import { exportPdfTex } from "./inkscapeUtils";

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
				logMessage(`SVG file changed : ${svgFilePath}`);
				exportPdfTex(imageFullPath);
				setupPdfTexWatcher(imageFullPath);
			})
			.on("unlink", () => {
				logMessage(`SVG file deleted: ${svgFilePath}`);
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
				logMessage(`pdf_tex file changed : ${pdftexFilePath}`);
				vscode.commands.executeCommand("latex-workshop.build")
				.then(
					() => {
						logMessage("LaTeX Workshop build command executed successfully.");
					},
					(error) => {
						logMessage(`Error executing LaTeX Workshop build command: ${error}`);
					}
				);
			})
			.on("unlink", () => {
				logMessage(`pdf_tex file deleted: ${pdftexFilePath}`);
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
