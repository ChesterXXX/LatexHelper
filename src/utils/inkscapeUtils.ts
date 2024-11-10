import * as vscode from "vscode";
import { exec } from "child_process";

let inkscapeLocation: string = "C:\\src\\InkScape\\bin\\inkscape.exe";

function setInkscapeLocation() {
    const config = vscode.workspace.getConfiguration("latex-helper");
	inkscapeLocation = config.get<string>("inkscapeExecutableLocation", "C:\\src\\InkScape\\bin\\inkscape.exe");
}

export function openInInkscape(imageFullPath: string) {
    const svgFullPath = `${imageFullPath}.svg`;

	setInkscapeLocation();
    
    const openInkscapeCommand = `"${inkscapeLocation}" "${svgFullPath}"`;
    console.log(`Opening InkScape : ${openInkscapeCommand}`);
	
    exec(openInkscapeCommand, (error, stdout, stderr) => {
		if (error) {
			console.error(`Error opening Inkscape: ${error}`);
			return;
		}
		console.log(`Inkscape opened with output: ${stdout}`);
	});
}

export function exportPdfTex(imageFullPath:string) {
    const pdfFullPath = `${imageFullPath}.pdf`;
    const svgFullPath = `${imageFullPath}.svg`;

	setInkscapeLocation();

    const exportCommand = `"${inkscapeLocation}" -D --export-latex --export-filename="${pdfFullPath}" "${svgFullPath}"`;
    console.log(`Exporting to pdf_tex : ${exportCommand}`);
	
    exec(exportCommand, (error, stdout, stderr) => {
		if (error) {
			console.error(`Error exporting PDFTeX: ${error}`);
			return;
		}
		console.log(`PDFTeX exported with output: ${stdout}`);
	});
}
