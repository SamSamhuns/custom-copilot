// src/config.ts

type ModelCapabilities = {
    [key: string]: string[];
};

// for reference
export const availableLLMModels: ModelCapabilities = {
    "starcoderbase-1b": ["generation, fill_in_the_middle"],
    "starcoderbase-3b": ["generation, fill_in_the_middle"],
    "starcoder2-3b": ["generation"]
};

export const config = {
    autocompleteModel: 'starcoder2-3b',
    uploadAPIURL: 'http://localhost:8002/upload',
    autocompleteAPIURL: 'http://localhost:8002/autocomplete',
    autocompleteDelay: 1000, // in milliseconds
    autocompleteInputPromptSize: 500,
    autocompleteInputMaxNewTokens: 75
};