import * as chokidar from "chokidar";
import * as vscode from "vscode";
import { logMessage } from "../extension";
import { watchCachedFiles } from "./cacheUtils";
import { exportPdfTex } from "./inkscapeUtils";
import path from "path";

const svgWatcher: chokidar.FSWatcher = chokidar.watch([], { persistent: true });
const pdftexWatcher: chokidar.FSWatcher = chokidar.watch([], { persistent: true });

function latexWorkshopBuild(){
	vscode.commands.executeCommand("latex-workshop.build").then(
		() => {
			logMessage("LaTeX Workshop build command executed successfully.");
		},
		(error) => {
			logMessage(`Error executing LaTeX Workshop build command: ${error}`);
		}
	);
}

export function setupWatchers() {
	svgWatcher
		.on("change", (svgFilePath) => {
			logMessage(`SVG file changed : ${svgFilePath}`);
			const imageFullPath = svgFilePath.replace(/\.svg$/, "");
			exportPdfTex(imageFullPath);
			addPdfTexToWatchlist(imageFullPath);
		})
		.on("unlink", (svgFilePath) => {
			logMessage(`SVG file deleted: ${svgFilePath}`);
			watchCachedFiles();
		});

	pdftexWatcher
		// .on("add", (pdftexFilePath) => {
		// 	logMessage(`pdf_tex file added: ${pdftexFilePath}`);
		// 	vscode.commands.executeCommand("latex-workshop.build").then(
		// 		() => {
		// 			logMessage("LaTeX Workshop build command executed successfully.");
		// 		},
		// 		(error) => {
		// 			logMessage(`Error executing LaTeX Workshop build command: ${error}`);
		// 		}
		// 	);
		// })
		.on("change", (pdftexFilePath) => {
			logMessage(`pdf_tex file changed : ${pdftexFilePath}`);
			latexWorkshopBuild();
		})
		.on("unlink", (pdftexFilePath) => {
			logMessage(`pdf_tex file deleted: ${pdftexFilePath}`);
			watchCachedFiles();
		});
}

export function addSvgToWatchlist(imageFullPath: string) {
	const svgFilePath: string = `${imageFullPath}.svg`;

	for (const [dir, files] of Object.entries(svgWatcher.getWatched())) {
		if (files.some((file) => path.join(dir, file) === svgFilePath)) {
			logMessage(`SVG file is already being watched: ${svgFilePath}`);
			return;
		}
	}

	svgWatcher.add(svgFilePath);
	logMessage(`Started watching SVG file: ${svgFilePath}`);
}

export function addPdfTexToWatchlist(imageFullPath: string, initialization:boolean = false) {
	const pdftexFilePath = `${imageFullPath}.pdf_tex`;

	for (const [dir, files] of Object.entries(pdftexWatcher.getWatched())) {
		if (files.some((file) => path.join(dir, file) === pdftexFilePath)) {
			logMessage(`pdf_tex file is already being watched: ${pdftexFilePath}`);
			return;
		}
	}
	pdftexWatcher.add(pdftexFilePath);
	logMessage(`Started watching pdf_tex file: ${pdftexFilePath}`);
	if(!initialization){
		latexWorkshopBuild();
	}
}

export function removeSvgFromWatchlist(imageFullPath: string) {
	const svgFilePath = `${imageFullPath}.svg`;

	for (const [dir, files] of Object.entries(svgWatcher.getWatched())) {
		if (files.some((file) => path.join(dir, file) === svgFilePath)) {
			svgWatcher.unwatch(svgFilePath);
			logMessage(`Stopped watching SVG file: ${svgFilePath}`);
			return;
		}
	}
	logMessage(`SVG file is not being watched: ${svgFilePath}`);
}

export function removePdfTexFromWatchlist(imageFullPath: string) {
	const pdftexFilePath = `${imageFullPath}.pdf_tex`;

	const conent = pdftexWatcher.getWatched();

	for (const [dir, files] of Object.entries(pdftexWatcher.getWatched())) {
		if (files.some((file) => path.join(dir, file) === pdftexFilePath)) {
			pdftexWatcher.unwatch(pdftexFilePath);
			logMessage(`Stopped watching pdf_tex file: ${pdftexFilePath}`);
			return;
		}
	}
	// logMessage(`pdf_tex file is not being watched: ${pdftexFilePath}`);
}
