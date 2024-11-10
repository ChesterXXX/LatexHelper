import path from "path";
import * as vscode from "vscode";

const defaultReplacementString = `\\begin{figure}[h]
	\\def\\svgwidth{\${1:#mul}\\columnwidth}
	\\import{#dir}{#filename.pdf_tex}
	\\label{fig:\${2:#filename}}
	\\caption{\${3:Some Figure}}
\\end{figure}`;

let figureNameRecorder: vscode.Disposable | undefined;
let isRecording = false;
let startPos: vscode.Position | undefined = undefined;
let endPos: vscode.Position | undefined = undefined;

function processFilename(recordedPath: string): { dir: string; filename: string } {
	let dirPath = path.dirname(recordedPath);
	let filename = path.basename(recordedPath);

	if (dirPath.startsWith("/")) {
		dirPath = `.${dirPath}`;
	} else if (dirPath !== ".") {
		dirPath = `./${dirPath}`;
	}

	return { dir: dirPath, filename: filename };
}

function getReplacementString(startPos: vscode.Position, endPos: vscode.Position, figureName: string, editor: vscode.TextEditor) {
	const lineNumber = startPos.line;
	const lineText = editor.document.lineAt(lineNumber).text;
	const indentationLength = lineText.search(/\S|$/);
	const isAtStartOfLine = startPos.character === indentationLength;
	
	let replacementString = vscode.workspace.getConfiguration("latex-helper").get<string>("figureEnvironmentSnippet", defaultReplacementString).replace(/\\n/g, '\n').replace(/\\t/g, '\t');
	if (!isAtStartOfLine) {
		replacementString = `\n${replacementString}`;
	}

	const { dir, filename } = processFilename(figureName);
	replacementString = replacementString.replaceAll("#mul", "0.5").replaceAll("#dir", dir).replaceAll("#filename", filename);

	const replacementLines = replacementString.split("\n");

	for (let i = 1; i < replacementLines.length; i++) {
		replacementLines[i] = " ".repeat(indentationLength) + replacementLines[i];
	}

	const finalReplacementString = replacementLines.join("\n");

	return finalReplacementString;
}

function replaceTextInRange(startPos: vscode.Position, endPos: vscode.Position) {
	const editor = vscode.window.activeTextEditor;
	if (editor && startPos.isBefore(endPos)) {
		const range = new vscode.Range(startPos, endPos);
		const figureName = editor.document.getText(range).trim().substring(1);
		vscode.window.showInformationMessage(`Figure name : ${figureName}`);
		if (/\s/.test(figureName)) {
			vscode.window.showWarningMessage(`Figure name should not contains whitespace.`);
			return;
		}

		let replacementString = getReplacementString(startPos, endPos, figureName, editor);

		const snippet = new vscode.SnippetString(replacementString);

		editor.insertSnippet(snippet, range).then(() => {
			vscode.window.showInformationMessage(`Text replaced with the formatted string.`);
		});
	}
}

function attachFigureNameRecorderListener() {
	figureNameRecorder = vscode.workspace.onDidChangeTextDocument((event) => {
		const editor = vscode.window.activeTextEditor;
		if (editor && event.document === editor.document) {
			const change = event.contentChanges[0];

			if (change && /\s/.test(change.text)) {
				isRecording = false;
				if (startPos) {
					endPos = editor.selection.active;
					replaceTextInRange(startPos, endPos);
					startPos = undefined;
					endPos = undefined;
				}
				figureNameRecorder?.dispose();
			}
		}
	});
}


export function figureActivation(context: vscode.ExtensionContext) {
	const figureTrigger = "@";

	const figureTriggerListener = vscode.workspace.onDidChangeTextDocument((event) => {
		const editor = vscode.window.activeTextEditor;
		if (editor && event.document === editor.document) {
			const change = event.contentChanges[0];

			if (change && change.text === figureTrigger) {
				if (isRecording) {
					endPos = editor.selection.active;
					if (startPos && endPos) {
						replaceTextInRange(startPos, endPos);
						startPos = undefined;
						endPos = undefined;
					}
					figureNameRecorder?.dispose();
				}
				isRecording = true;
				startPos = editor.selection.active;
				endPos = undefined;
				attachFigureNameRecorderListener();
			}
		}
	});

	context.subscriptions.push(figureTriggerListener);
}
