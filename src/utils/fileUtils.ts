import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

export function getFullPath(fileName: string): string | null {
	const regex = /^([a-zA-Z0-9-_./]+\/)?([a-zA-Z0-9-_]+)(\.[a-zA-Z0-9]+)?$/;
	if (!regex.test(fileName)) {
		vscode.window.showErrorMessage("Invalid input format. Ensure it's in 'some/path/filename' format.");
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

export function openFile(fullPath: string) {
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
