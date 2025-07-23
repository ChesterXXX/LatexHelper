import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { logMessage } from "../extension";

export function texMergerActivate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand("latex-helper.mergeTexFiles", async () => {
			const editor = vscode.window.activeTextEditor;
			if (editor) {
				const filePath = editor.document.uri.fsPath;
				const fileName = path.basename(filePath);
				const defaultName = fileName.replace(/\.tex$/, "_merged");

				const mergeFileName = await vscode.window.showInputBox({
					prompt: "Enter name for merged .tex file",
					value: defaultName,
				});

				if (mergeFileName) {
					const replaceBBL = await vscode.window.showQuickPick(["Yes", "No"], {
						placeHolder: "Replace \\bibliography{...} with contents of the .bbl file?",
					});
					if (replaceBBL) {
						logMessage(`Merge filename: ${mergeFileName}`);
						createNewTexFromInputs(filePath, mergeFileName, replaceBBL);
					}
				}
			}
		}),
		vscode.commands.registerCommand("latex-helper.replaceBBL", async () => {
			const editor = vscode.window.activeTextEditor;
			if (editor) {
				const filePath = editor.document.uri.fsPath;
				const fileName = path.basename(filePath);
				const defaultName = fileName.replace(/\.tex$/, "_merged_bib");

				const mergeFileName = await vscode.window.showInputBox({
					prompt: "Enter name for bibliography merged .tex file",
					value: defaultName,
				});

				if (mergeFileName) {
					logMessage(`Merge filename: ${mergeFileName}`);
					replaceBibliographyFile(filePath, mergeFileName);
				}
			}
		})
	);
}

function createNewTexFromInputs(mainFilePath: string, outputFileName: string, replaceBBL: string) {
	let content = replaceInputFiles(mainFilePath);

	if (replaceBBL === "Yes") {
		content = replaceBibliography(content, mainFilePath);
	}

	const outputPath = path.resolve(path.dirname(mainFilePath), outputFileName.endsWith(".tex") ? outputFileName : outputFileName + ".tex");
	writeAndOpenTex(content, outputPath);
}

function replaceInputFiles(mainFilePath: string): string {
	let workingDir = path.dirname(mainFilePath);
	let content = fs.readFileSync(mainFilePath, "utf8");

	const inputRegex = /\\input\{([^}]+)\}/g;
	while (inputRegex.test(content)) {
		content = content.replace(inputRegex, (match, relPath) => {
			const hasTexExt = relPath.toLowerCase().endsWith(".tex");
			const inputPath = path.resolve(workingDir, hasTexExt ? relPath : relPath + ".tex");

			try {
				return fs.readFileSync(inputPath, "utf8");
			} catch (err) {
				logMessage(`While merging could not read ${inputPath}`);
				return `% Failed to include ${relPath}`;
			}
		});
	}
	return content;
}

function replaceBibliography(content: string, mainFilePath: string): string {
	const dir = path.dirname(mainFilePath);
	const baseName = path.basename(mainFilePath, ".tex");
	const bblPath = path.resolve(dir, `${baseName}.bbl`);

	if (!fs.existsSync(bblPath)) {
		logMessage(`.bbl file not found: ${bblPath}`);
		return content;
	}

	let bblContent: string;
	try {
		bblContent = fs.readFileSync(bblPath, "utf8");
	} catch (err) {
		logMessage(`Failed to read .bbl file: ${err}`);
		return content;
	}

	const bibRegex = /\\bibliography\s*{[^}]*}/g;
	return content.replace(bibRegex, bblContent);
}

function replaceBibliographyFile(mainFilePath: string, outputFileName: string) {
	let content: string;
	try {
		content = fs.readFileSync(mainFilePath, "utf8");
	} catch (err) {
		logMessage(`Failed to read main file: ${err}`);
		return;
	}

	const updatedContent = replaceBibliography(content, mainFilePath);

	const outputPath = path.resolve(path.dirname(mainFilePath), outputFileName.endsWith(".tex") ? outputFileName : outputFileName + ".tex");

	writeAndOpenTex(updatedContent, outputPath);
}

function writeAndOpenTex(content: string, outputPath: string) {
	try {
		fs.writeFileSync(outputPath, content, "utf8");
		logMessage(`Wrote new tex file: ${outputPath}`);
		vscode.workspace.openTextDocument(outputPath).then((doc) => {
			vscode.window.showTextDocument(doc);
		});
	} catch (err) {
		logMessage(`Failed to write file: ${err}`);
	}
}
