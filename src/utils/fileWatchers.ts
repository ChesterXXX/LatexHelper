import * as vscode from "vscode";
import * as chokidar from 'chokidar';
import { exportPdfTex } from "./inkscapeUtils";

const svgWatchers: chokidar.FSWatcher[] = [];
const pdfTexWatchers: chokidar.FSWatcher[] = [];

export function setupSVGWatcher(imageFullPath: string) {
	const svgFilePath:string = `${imageFullPath}.svg`;
	const svgWatcher = chokidar.watch(svgFilePath, { persistent: true });
	svgWatchers.push(svgWatcher);
	svgWatcher.on('change', () => {
		console.log(`SVG file changed : ${svgFilePath}`);
		exportPdfTex(imageFullPath);
		setupPdfTexWatcher(imageFullPath);
	});
}

function setupPdfTexWatcher(imageFullPath: string) {
	const pdftexFilePath = `${imageFullPath}.pdf_tex`;
	const pdfTexWatcher = chokidar.watch(pdftexFilePath, { persistent: true });
	pdfTexWatchers.push(pdfTexWatcher);
	pdfTexWatcher.on('change', () => {
		console.log(`pdf_tex file changed : ${pdftexFilePath}`);
		vscode.window.showInformationMessage(`pdf_tex file has been updated : ${pdftexFilePath}`);
	});
}
