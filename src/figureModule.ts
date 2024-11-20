import path from "path";
import * as vscode from "vscode";
import { logMessage } from "./extension";

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
	const lineFirstChar = lineText.search(/\S|$/);
	const isAtStartOfLine = startPos.character === lineFirstChar;
	
	let replacementString = vscode.workspace.getConfiguration("latex-helper").get<string>("figureEnvironmentSnippet", defaultReplacementString).replace(/\\n/g, '\n').replace(/\\t/g, '\t');
	if (!isAtStartOfLine) {
		replacementString = `\n${replacementString}`;
	}

	const { dir, filename } = processFilename(figureName);
	const finalReplacementString = replacementString.replaceAll("#mul", "0.5").replaceAll("#dir", dir).replaceAll("#filename", filename);

	return finalReplacementString;
}

function replaceTextInRange(startPos: vscode.Position, endPos: vscode.Position) {
	const editor = vscode.window.activeTextEditor;
	if (editor && startPos.isBefore(endPos)) {
		const range = new vscode.Range(startPos, endPos);
		const figureName = editor.document.getText(range).trim().substring(1);
		logMessage(`Figure name : ${figureName}`);
		if (/\s/.test(figureName)) {
			vscode.window.showWarningMessage(`Figure name should not contains whitespace.`);
			return;
		}

		let replacementString = getReplacementString(startPos, endPos, figureName, editor);

		const snippet = new vscode.SnippetString(replacementString);

		editor.insertSnippet(snippet, range).then(() => {
			logMessage(`Figure snippet applied.`);
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


export function figureActivate(context: vscode.ExtensionContext) {
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
