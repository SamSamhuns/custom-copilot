import * as vscode from 'vscode';
import { config } from './config';


type ApiResponse = {
    results: Array<{ text: string }>;
};

export class LLMInlineCompletionItemProvider implements vscode.InlineCompletionItemProvider {
    private lastKeyPressedTime: number = Date.now();
    private delay: number = config.autocompleteDelay; // in milliseconds

    constructor() {
        vscode.workspace.onDidChangeTextDocument(event => {
            if (event.contentChanges.length > 0) {
                this.lastKeyPressedTime = Date.now();
            }
        });
    }

    async provideInlineCompletionItems(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.InlineCompletionList> {
        const currentTime = Date.now();
        if (currentTime - this.lastKeyPressedTime < this.delay) {
            await new Promise(resolve => setTimeout(resolve, this.delay - (currentTime - this.lastKeyPressedTime)));
        }

        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        const completionItems: vscode.InlineCompletionItem[] = [];
        const textUpToCursor = document.getText(new vscode.Range(new vscode.Position(0, 0), position));

        try {
            const response = await fetch(config.autocompleteAPIURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify({ prompt: textUpToCursor }),
            });

            // note response must be of fmt {"results": [{ "text": "RESULT_TEXT" }]}
            const json = await response.json() as ApiResponse;
            const predictions = json.results;

            for (const prediction of predictions) {
                const code = prediction.text.trim();
                const completionText = code;
                const completionRange = new vscode.Range(position, position.translate(0, completionText.length));
                completionItems.push({
                    insertText: completionText,
                    range: completionRange
                });
            }
        } catch (err) {
            console.error('Error while calling LLM API call:', err);
        }

        return { items: completionItems };
    }
}