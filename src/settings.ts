// settings.ts
import * as vscode from 'vscode';

export const DEBUG_MODE = true;  // change this to false when publishing extension

// Settings interface
interface Settings {
    uploadAPIURL: string;
    chatWithLLMModel: string;
    chatWithLLMAPIURL: string;
    chatWithLLMMaxTokens: number;
    chatWithLLMMaxTemperature: number;
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

    chatWithLLMModel: 'gpt-3.5-turbo-0125',
    chatWithLLMAPIURL: 'http://localhost:8002/chat',
    chatWithLLMMaxTokens: 150,
    chatWithLLMMaxTemperature: 0.7,

    autocompleteModel: 'starcoder2-3b',
    autocompleteAPIURL: 'http://localhost:8002/autocomplete',
    autocompleteDelay: 1500, // in milliseconds
    autocompleteInputPromptSize: 500, // doubled when using fill_in_middle models
    autocompleteInputMaxNewTokens: 50
};

export function overrideSettings() {
    console.log("Overriding settings from config");
    const config = vscode.workspace.getConfiguration("custom-copilot");
    // Register settings and set defaults
    for (const key in settings) {
        const value = settings[key as keyof Settings];  // Using type assertion here
        config.update(key, value, vscode.ConfigurationTarget.Global);
    }
}
