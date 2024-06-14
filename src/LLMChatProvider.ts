// Chat with LLM
import * as vscode from 'vscode';

// get vscode configuration
const config = vscode.workspace.getConfiguration("custom-copilot");


export class LLMCommunicator {
    static async send(message: string): Promise<string> {
        // Example: POST request to your LLM API
        // You would replace this with actual code to send a request to your API
        console.log("LLMComm Message should be sent to url", config.chatWithLLMAPIURL);
        console.log("LLMComm Message sent to LLM:", message);
        return "Response from LLM: [Your response here]";
    }
}