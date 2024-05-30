// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// The commandId parameter must match the command field in package.json

	// This line of code will only be executed once when your extension is activated
	console.log('Extension "custom-copilot" is now active');

	let getCurrentTime = vscode.commands.registerCommand('custom-copilot.displayCurrentTime', () => {
		// Get the current date and time
		const now = new Date();
		const currentTime = now.toLocaleTimeString(); // Converts time to string based on local locale settings

		// Display the current time in an information message box
		vscode.window.showInformationMessage(`Current time: ${currentTime}`);
	});

	let extensionInfo = vscode.commands.registerCommand('custom-copilot.extensionInfo', () => {
		vscode.window.showInformationMessage('Welcome to custom-copilot for generating code completion with custom LLMs!');
	});

	context.subscriptions.push(getCurrentTime);
	context.subscriptions.push(extensionInfo);
}

// This method is called when your extension is deactivated
export function deactivate() {}
