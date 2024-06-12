// apiHandler.ts
import * as vscode from 'vscode';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import FormData from 'form-data';
import { config } from './config';


export async function uploadFilesToAPI(uris: vscode.Uri[]) {
    const formData = new FormData();

    uris.forEach(uri => {
        const fileStream = fs.createReadStream(uri.fsPath); // Ensure you use fsPath
        formData.append('files', fileStream, path.basename(uri.fsPath));
    });

    try {
        const response = await axios.post(config.uploadAPIURL, formData, {
            headers: {
                ...formData.getHeaders() // Ensure headers include Content-Type with boundary
            }
        });
        vscode.window.showInformationMessage('Files uploaded successfully.');
    } catch (error) {
        vscode.window.showErrorMessage('Failed to upload files.');
        console.error('Error:', error);
    }
}

export async function uploadFolderToAPI(folderPath: string) {
    const formData = new FormData();

    const files = await vscode.workspace.fs.readDirectory(vscode.Uri.file(folderPath));

    for (const [file, type] of files) {
        if (type === vscode.FileType.File && file.endsWith('.py')) {
            const filePath = path.join(folderPath, file);
            formData.append('files', fs.createReadStream(filePath), file);
        }
    }

    try {
        const response = await axios.post(config.uploadAPIURL, formData, {
            headers: {
                ...formData.getHeaders() // form-data takes care of the Content-Type
            }
        });

        if (response.status !== 200) {
            throw new Error(`Failed to send data to the API: ${response.statusText}`);
        }
        vscode.window.showInformationMessage('Files successfully sent to the API!');
    } catch (error) {
        vscode.window.showErrorMessage(`Error sending files: ${error}`);
        console.error('Error:', error);
    }
}
