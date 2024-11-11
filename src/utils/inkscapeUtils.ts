import * as vscode from "vscode";
import { exec } from "child_process";
import { logMessage } from "../extension";

let inkscapeLocation: string;
let inkscapeExportCommand: string;

function setInkscapeLocation() {
    const config = vscode.workspace.getConfiguration("latex-helper");
	inkscapeLocation = config.get<string>("inkscapeExecutableLocation", "C:\\src\\InkScape\\bin\\inkscape.exe");
	inkscapeExportCommand = config.get<string>("inkscapeExportCommand", "\"#executable\" -D --export-latex --export-dpi 300 --export-filename=\"#pdf\" \"#svg\"");
}

export function openInInkscape(imageFullPath: string) {
    const svgFullPath = `${imageFullPath}.svg`;

	setInkscapeLocation();
    
    const openInkscapeCommand = `"${inkscapeLocation}" "${svgFullPath}"`;
    logMessage(`Opening InkScape : ${openInkscapeCommand}`);
	
    exec(openInkscapeCommand, (error, stdout, stderr) => {
		if (error) {
			console.error(`Error opening Inkscape: ${error}`);
			return;
		}
		logMessage(`Inkscape opened with output: ${stdout}`);
	});
}

export function exportPdfTex(imageFullPath:string) {
    const pdfFullPath = `${imageFullPath}.pdf`;
    const svgFullPath = `${imageFullPath}.svg`;

	setInkscapeLocation();

	const exportCommand = inkscapeExportCommand.replaceAll("#executable", inkscapeLocation).replaceAll("#pdf", pdfFullPath).replaceAll("#svg", svgFullPath);

    logMessage(`Exporting to pdf_tex : ${exportCommand}`);
	
    exec(exportCommand, (error, stdout, stderr) => {
		if (error) {
			console.error(`Error exporting PDFTeX: ${error}`);
			return;
		}
		logMessage(`PDFTeX exported with output: ${stdout}`);
	});
}
