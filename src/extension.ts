// main extension file
import * as vscode from 'vscode';
import { LLMInlineCompletionItemProvider } from "./LLMInlineCompletionItemProvider";
import { uploadFolderToAPI, uploadFilesToAPI } from "./fileApiHandler";
import { LLMCommunicator } from "./LLMChatProvider";
import { registerSettings } from "./settings";
import { getWebviewContent } from "./webviews/viewProvider";


// The extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// The commandId parameter must match the command field in package.json

	// register confs from settings.json into the vscode workspace. Need to rebuild for new settings to work
	registerSettings();

	// This line of code will only be executed once when your extension is activated
	console.log('Extension "custom-copilot" is now active');

	// Get current system time, TODO remove later
	let displayCurrentTime = vscode.commands.registerCommand('custom-copilot.displayCurrentTime', () => {
		// Get the current date and time
		const now = new Date();
		const currentTime = now.toLocaleTimeString(); // Converts time to string based on local locale settings
		vscode.window.showInformationMessage(`Current time: ${currentTime}`);
	});

	let providerRegistration: vscode.Disposable | null = null;  // Holds the registration of the completion provider

	// Command to activate the Inline Completion Provider
	let activateCompletionProvider = vscode.commands.registerCommand('custom-copilot.activateCompletionProvider', () => {
		if (!providerRegistration) {  // Check if the provider is already registered
			const provider = new LLMInlineCompletionItemProvider();
			providerRegistration = vscode.languages.registerInlineCompletionItemProvider(
				{ scheme: 'file', language: 'python' }, provider);
			context.subscriptions.push(providerRegistration);
			vscode.window.showInformationMessage('Custom Code Completion Provider Activated');
		} else {
			vscode.window.showInformationMessage('Custom Code Completion Provider is already active');
		}
	});

	// Command to deactivate the Inline Completion Provider
	let deactivateCompletionProvider = vscode.commands.registerCommand('custom-copilot.deactivateCompletionProvider', () => {
		if (providerRegistration) {  // Check if there is something to unregister
			// Remove the provider from subscriptions to deactivate it
			const index = context.subscriptions.indexOf(providerRegistration);
			if (index > -1) {
				context.subscriptions.splice(index, 1); // Remove from the subscription list
			}
			providerRegistration.dispose();  // Dispose the provider
			providerRegistration = null;  // Clear the registration reference
			vscode.window.showInformationMessage('Custom Code Completion Provider Deactivated');
		} else {
			vscode.window.showInformationMessage('Custom Code Completion Provider is not active');
		}
	});

	// Command to send folder to api
	let uploadFolder = vscode.commands.registerCommand('custom-copilot.uploadFolder', async () => {
		const options: vscode.OpenDialogOptions = {
			canSelectMany: false,
			openLabel: 'Select Folder',
			canSelectFolders: true,
			canSelectFiles: false
		};

		const folderUri = await vscode.window.showOpenDialog(options);
		if (folderUri && folderUri.length > 0) {
			await uploadFolderToAPI(folderUri[0].fsPath);
		} else {
			vscode.window.showInformationMessage('Folder selection was canceled.');
		}
	});

	// Command to send file(s) to api
	let uploadFiles = vscode.commands.registerCommand('custom-copilot.uploadFiles', async () => {
		const uris = await vscode.window.showOpenDialog({
			openLabel: 'Upload',
			canSelectMany: true
		});

		if (uris && uris.length > 0) {
			await uploadFilesToAPI(uris); // Using await here to handle async call
		} else {
			vscode.window.showInformationMessage('No files selected.');
		}
	});

	// Command to chat after uploading file with LLM
	let chatWithLLM = vscode.commands.registerCommand('custom-copilot.chatWithLLM', () => {
		const panel = vscode.window.createWebviewPanel(
			'chatWithLLM', // Type identifier for internal use
			'Chat with LLM', // Title of the panel displayed to the user
			vscode.ViewColumn.One, // Shows the webview in the first column
			{
				enableScripts: true, // Allow scripts for interactive content
				retainContextWhenHidden: true // Keep the state of the webview when switching tabs
			}
		);

		panel.webview.html = getWebviewContent(panel.webview, context.extensionUri);

		panel.webview.onDidReceiveMessage(
			async message => {
				switch (message.command) {
					case 'send':
						try {
							const response = await LLMCommunicator.send(message.text);
							panel.webview.postMessage({ command: 'response', text: response });
						} catch (error) {
							console.error("Failed to send message to LLM:", error);
							panel.webview.postMessage({ command: 'response', text: "Error communicating with LLM." });
						}
						break;
				}
			},
			undefined,
			context.subscriptions
		);
	});

	// Subscription to ensure they are disposed when the extension is deactivated
	context.subscriptions.push(displayCurrentTime, 
		activateCompletionProvider, deactivateCompletionProvider,
		uploadFolder, uploadFiles, chatWithLLM);
}

// This method is called when your extension is deactivated
export function deactivate() { }
