import * as vscode from 'vscode';
import { config, availableLLMModels } from './config';


type ApiResponse = {
    results: Array<{ text: string }>;
};

export class LLMInlineCompletionItemProvider implements vscode.InlineCompletionItemProvider {
    private debounceTimeout: NodeJS.Timeout | null = null;
    private debounceTimeInMilliseconds = config.autocompleteDelay;

    provideInlineCompletionItems(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.InlineCompletionList> {
        // use debouncing to set timeouts when cursor is inactive before sending requests to API
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }

        return new Promise((resolve) => {
            this.debounceTimeout = setTimeout(async () => {
                const completionItems = await this.fetchCompletionItems(document, position);
                resolve({ items: completionItems });
            }, this.debounceTimeInMilliseconds);
        });
    }

    private async fetchCompletionItems(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.InlineCompletionItem[]> {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        let prompt: string;
        const contextWindow = config.autocompleteInputPromptSize;

        // get context above cursor
        let textAboveCursor = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
        let wordsAbove = textAboveCursor.split(/\s+/);
        if (wordsAbove.length > contextWindow) {
            wordsAbove = wordsAbove.slice(wordsAbove.length - contextWindow);
        }
        textAboveCursor = wordsAbove.join(' ');

        // check if available model supports fill_in_the_middle task
        if (availableLLMModels[config.autocompleteModel].includes("fill_in_the_middle")) {
            // process context for the input prompt with fill in the middle objective
            // get context below cursor
            let textBelowCursor = document.getText(new vscode.Range(position, new vscode.Position(document.lineCount, document.lineAt(document.lineCount - 1).range.end.character)));
            let wordsBelow = textBelowCursor.split(/\s+/);
            if (wordsBelow.length > contextWindow) {
                wordsBelow = wordsBelow.slice(0, contextWindow);
            }
            textBelowCursor = wordsBelow.join(' ');

            prompt = `<fim_prefix>${textAboveCursor}<fim_suffix>${textBelowCursor}<fim_middle>`;
        } else {
            // process context for code generation objective
            // get context above cursor only
            prompt = textAboveCursor;
        }

        const completionItems: vscode.InlineCompletionItem[] = [];
        try {
            const response = await fetch(config.autocompleteAPIURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify({ prompt, max_new_tokens: config.autocompleteInputMaxNewTokens, model: config.autocompleteModel }),
            });

            const json = await response.json() as ApiResponse;
            const predictions = json.results;

            for (const prediction of predictions) {
                // strip the prompt part from the autocomplete prediction
                const completionText = prediction.text.substring(prompt.length).trim();
                const completionRange = new vscode.Range(position, position.translate(0, completionText.length));
                completionItems.push({
                    insertText: completionText,
                    range: completionRange
                });
            }

        } catch (err) {
            console.error('Error while calling LLM API:', err);
        }

        return completionItems;
    }
}