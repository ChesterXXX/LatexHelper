import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { logMessage } from "../extension";

const localConfigFileName = "latex-helper.json";
const vscodeSettingsFileName = "settings.json";

function isWorkspaceAvailable(): boolean {
	return vscode.workspace.workspaceFolders !== undefined;
}

function getLocalConfigFilePath(): string | undefined {
	let filePath: string;

	if (isWorkspaceAvailable()) {
		const workspaceFolder = vscode.workspace.workspaceFolders![0].uri.fsPath;
		const vscodeFolderPath = path.join(workspaceFolder, ".vscode");

		if (!fs.existsSync(vscodeFolderPath)) {
			fs.mkdirSync(vscodeFolderPath, { recursive: true });
		}

		filePath = path.join(vscodeFolderPath, vscodeSettingsFileName);
	} else {
		filePath = `${process.cwd()}/${localConfigFileName}`;
	}

	if (!fs.existsSync(filePath)) {
		try {
			fs.writeFileSync(filePath, "{}", "utf-8");
			logMessage(`Created empty local settings file: ${filePath}`);
		} catch (error) {
			logMessage(`Could not create local config file: ${filePath}`, error);
			return;
		}
	}
	return filePath;
}

const defaultTypeCheck = (item: any) => typeof item === "string";

function getLocalConfig<T>(settingName: string, defaultValue: T, typeCheck: (item: any) => boolean = defaultTypeCheck): T | undefined {
	const filePath = getLocalConfigFilePath();
	
	let fileData;
	
	if (filePath) {
		fileData = fs.readFileSync(filePath, "utf-8");
	} else {
		return;
	}

	try {
		const jsonData = JSON.parse(fileData);

		if (jsonData && typeof jsonData === "object") {
			if (settingName in jsonData) {
				const value = jsonData[settingName];
				if (Array.isArray(defaultValue)) {
					if (Array.isArray(value) && value.every((item: any) => typeCheck(item))) {
						return value as T;
					} else {
						logMessage(`The setting "${settingName}" is not valid. Resetting to default.`);
						jsonData[settingName] = defaultValue;
						fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), "utf-8");
						return defaultValue;
					}
				} else if (typeof value === typeof defaultValue) {
					return value as T;
				} else {
					logMessage(`The setting "${settingName}" is not valid. Resetting to default.`);
					jsonData[settingName] = defaultValue;
					fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), "utf-8");
					return defaultValue;
				}
			} else {
				logMessage(`The setting "${settingName}" is missing. Setting to default.`);
				jsonData[settingName] = defaultValue;
				fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), "utf-8");
				return defaultValue;
			}
		} else {
			vscode.window.showWarningMessage("The settings JSON data is not valid.");
			return undefined;
		}
	} catch (error) {
		vscode.window.showErrorMessage(`Error parsing JSON from settings file: ${error}`);
		return undefined;
	}
}

function setLocalConfig<T>(settingName: string, value: T): void {
	const filePath = getLocalConfigFilePath();
	
	let fileData;

	if (filePath) {
		fileData = fs.readFileSync(filePath, "utf-8");
	} else {
		return;
	}

	try {
		const jsonData = JSON.parse(fileData);
		if (jsonData && typeof jsonData === "object") {
			jsonData[settingName] = value;
		}  else {
			vscode.window.showWarningMessage("The settings JSON data is not valid.");
		}
		fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), "utf-8");
		logMessage(`Setting "${settingName}" updated successfully.`);
	} catch (error) {
		vscode.window.showErrorMessage(`Error updating setting "${settingName}": ${error}`);
	}
}

const watchListConfigName = "latex-helper.fileWatchList";

export function getLocalConfigFileWatchList() : string[] | undefined{
	return getLocalConfig<string[]>(watchListConfigName, []);
}

export function setLocalConfigFileWatchList(watchList: string[]){
	setLocalConfig<string[]>(watchListConfigName, watchList);
}