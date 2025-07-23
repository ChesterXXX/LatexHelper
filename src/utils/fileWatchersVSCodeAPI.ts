import * as vscode from "vscode";
import { logMessage } from "../extension";
import { exportPdfTex } from "./inkscapeUtils";
import { latexWorkshopBuild } from "./latexWorkshopUtils";

// Create watchers for all .svg and .pdf_tex files in workspace
let svgWatcher: vscode.FileSystemWatcher;
let pdftexWatcher: vscode.FileSystemWatcher;

export function setupWatchersVSCodeAPI(context: vscode.ExtensionContext) {
	svgWatcher = vscode.workspace.createFileSystemWatcher("**/*.svg");
	pdftexWatcher = vscode.workspace.createFileSystemWatcher("**/*.pdf_tex");

	svgWatcher.onDidChange((uri) => {
		const svgFilePath = uri.fsPath;
		logMessage(`(VSCode API) SVG file changed : ${svgFilePath}`);
		const imageFullPath = svgFilePath.replace(/\.svg$/, "");
		exportPdfTex(imageFullPath);
	});

	svgWatcher.onDidDelete((uri) => {
		const svgFilePath = uri.fsPath;
		logMessage(`(VSCode API) SVG file deleted: ${svgFilePath}`);
	});

	pdftexWatcher.onDidCreate((uri) => {
		const pdftexFilePath = uri.fsPath;
		logMessage(`(VSCode API) pdf_tex file created : ${pdftexFilePath}`);
		latexWorkshopBuild();
	});

	pdftexWatcher.onDidChange((uri) => {
		const pdftexFilePath = uri.fsPath;
		logMessage(`(VSCode API) pdf_tex file changed : ${pdftexFilePath}`);
		latexWorkshopBuild();
	});

	pdftexWatcher.onDidDelete((uri) => {
		const pdftexFilePath = uri.fsPath;
		logMessage(`(VSCode API) pdf_tex file deleted: ${pdftexFilePath}`);
	});

	context.subscriptions.push(svgWatcher, pdftexWatcher);
}

export function disposeWatchersVSCodeAPI() {
	if (svgWatcher) {
		svgWatcher.dispose();
	}
	if (pdftexWatcher) {
		pdftexWatcher.dispose();
	}
}
