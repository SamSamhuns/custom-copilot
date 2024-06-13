// settings.ts
import * as vscode from 'vscode';

// Settings interface
interface Settings {
    autocompleteModel: string;
    uploadAPIURL: string;
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
    autocompleteModel: 'starcoder2-3b',
    uploadAPIURL: 'http://localhost:8002/upload',
    autocompleteAPIURL: 'http://localhost:8002/autocomplete',
    autocompleteDelay: 1000, // in milliseconds
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
