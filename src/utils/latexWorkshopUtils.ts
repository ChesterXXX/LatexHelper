import * as vscode from "vscode";
import { logMessage } from "../extension";

const LATEX_WORKSHOP_ID = "James-Yu.latex-workshop";

function isLatexWorkshopAvailable() {
	let isInstalled = false;
	let isActive = false;
	const extension = vscode.extensions.getExtension(LATEX_WORKSHOP_ID);
	if (extension) {
		isInstalled = true;
		isActive = extension.isActive;
	}
	return { isInstalled, isActive };
}

export function latexWorkshopBuild() {
	const { isInstalled, isActive } = isLatexWorkshopAvailable();
	if (isInstalled) {
		if (isActive) {
			vscode.commands.executeCommand("latex-workshop.build").then(
				() => {
					logMessage("LaTeX Workshop build command executed successfully.");
				},
				(error) => {
					logMessage(`Error executing LaTeX Workshop build command: ${error}`);
				}
			);
		} else {
			logMessage("LaTeX Workshop is installed, but not active. Cannot build project.");
		}
	} else {
		logMessage("LaTeX Workshop is not installed. Cannot build project.");
	}
}

export function latexWorkshopFormatBib() {
	const { isInstalled, isActive } = isLatexWorkshopAvailable();
	if (isInstalled) {
		if (isActive) {
			vscode.commands.executeCommand("latex-workshop.bibalign").then(
				() => {
					logMessage("LaTeX Workshop bib align command executed successfully.");
				},
				(error) => {
					logMessage(`Error executing LaTeX Workshop bib align command: ${error}`);
				}
			);
		} else {
			logMessage("LaTeX Workshop is installed, but not active. Cannot align bib.");
		}
	} else {
		logMessage("LaTeX Workshop is not installed. Cannot align bib.");
	}
}
