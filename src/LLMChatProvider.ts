import * as vscode from 'vscode';


// get vscode configuration
const config = vscode.workspace.getConfiguration("custom-copilot");

export class LLMCommunicator {
    static async send(message: string): Promise<string> {
        let prompt: string = message;
        try {
            const response = await fetch(config.chatWithLLMAPIURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    model: config.chatWithLLMModel,
                    max_tokens: config.chatWithLLMMaxTokens,
                    temperature: config.chatWithLLMMaxTemperature
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Assert the type of the JSON response
            const data = await response.json() as { response?: string };
            if (data && data.response) {
                return data.response;
            } else {
                console.error('No response in data:', data);
                return "No valid response received";
            }
        } catch (err) {
            console.error('Error while calling LLM API:', err);
            return "Error in communication";
        }
    }
}
