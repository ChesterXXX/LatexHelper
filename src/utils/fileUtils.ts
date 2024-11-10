import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

export function getFullPath(fileName: string): string | null {
	const regex = /^([a-zA-Z0-9-_./]+\/)?([a-zA-Z0-9-_]+)(\.[a-zA-Z0-9_]+)?$/;
	if (!regex.test(fileName)) {
		vscode.window.showErrorMessage(`Invalid input format : ${fileName}\nEnsure it's in 'some/path/filename' format.`);
		return null;
	}

	if (!path.extname(fileName)) {
		fileName = `${fileName}.tex`;
	}

	const currentWorkingDir = getWorkspaceFolder();
	return path.join(currentWorkingDir, fileName);
}

function getWorkspaceFolder() {
	if (vscode.workspace.workspaceFolders) {
		return vscode.workspace.workspaceFolders[0].uri.fsPath;
	}
	return process.cwd();
}

function getSVGTemplate(){
    const config = vscode.workspace.getConfiguration('latex-helper');
    const width = config.get<number>('svgWidth', 160);
    const height = config.get<number>('svgHeight', 80);

    const svgTemplate = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" />`;

    return svgTemplate;
}

export function createFile(fullPath: string): boolean {
	try {
		if (fs.existsSync(fullPath)) {
			return true;
		}
		const dir = path.dirname(fullPath);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
			console.log(`Created directories: ${dir}`);
		}

		fs.writeFileSync(fullPath, "");
		console.log(`Created new file : ${fullPath}`);
		return true;
	} catch (error) {
		vscode.window.showErrorMessage(`Failed to create the file :\n${fullPath}`);
		return false;
	}
}

export function createSVGFile(imageFullPath: string): boolean {
	// <svg width="160" height="80" viewBox="0 0 160 80" />
	const svgFullPath = `${imageFullPath}.svg`;
	try {
		if (fs.existsSync(svgFullPath)) {
			console.log(`SVG file exists : ${svgFullPath}.`);
			return true;
		}
		const dir = path.dirname(svgFullPath);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
			console.log(`Created directories: ${dir}`);
		}
		const svgTemplate = getSVGTemplate();
		fs.writeFileSync(svgFullPath, svgTemplate);
		console.log(`Created new SVG file : ${svgFullPath}`);
		return true;
	} catch (error) {
		vscode.window.showErrorMessage(`Failed to create the svg file :\n${svgFullPath}`);
		return false;
	}
}

export function openFileInTab(fullPath: string) {
	const openedEditor = findOpenedEditor(fullPath);

	if (openedEditor) {
		vscode.window.showTextDocument(openedEditor.document, { preview: false });
	} else {
		vscode.workspace.openTextDocument(fullPath).then(
			(document) => vscode.window.showTextDocument(document, { preview: false }),
			() => vscode.window.showErrorMessage(`Failed to open :\n${fullPath}`)
		);
	}
}

function findOpenedEditor(fullPath: string): vscode.TextEditor | undefined {
	const openedEditors = vscode.window.visibleTextEditors;
	return openedEditors.find((editor) => editor.document.uri.fsPath === fullPath);
}
