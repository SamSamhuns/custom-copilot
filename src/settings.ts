// settings.ts
import * as vscode from 'vscode';

// Settings interface
interface Settings {
    uploadAPIURL: string;
    chatWithLLMAPIURL: string;
    autocompleteModel: string;
    autocompleteAPIURL: string;
    autocompleteDelay: number;
    autocompleteInputPromptSize: number;
    autocompleteInputMaxNewTokens: number;
}

// ModelCapabilities Type
type ModelCapabilities = {
    [key: string]: string[];
};


export const availableLLMModels: ModelCapabilities = {
    "starcoderbase-1b": ["generation, fill_in_the_middle"],
    "starcoderbase-3b": ["generation, fill_in_the_middle"],
    "starcoder2-3b": ["generation"]
};

export const settings: Settings = {
    uploadAPIURL: 'http://localhost:8002/upload',
    chatWithLLMAPIURL: 'http://localhost:8002/chat',
    autocompleteModel: 'starcoder2-3b',
    autocompleteAPIURL: 'http://localhost:8002/autocomplete',
    autocompleteDelay: 1500, // in milliseconds
    autocompleteInputPromptSize: 500, // doubled when using fill_in_middle models
    autocompleteInputMaxNewTokens: 50
};

export function registerSettings() {
    const configuration = vscode.workspace.getConfiguration("custom-copilot");
    // Register settings and set defaults
    for (const key in settings) {
        const value = settings[key as keyof Settings];  // Using type assertion here
        configuration.update(key, value, vscode.ConfigurationTarget.Global);
    }
}
