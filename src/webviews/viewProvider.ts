import * as vscode from 'vscode';


export function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
    // Get path to resource on disk
    const scriptPathOnDisk = vscode.Uri.joinPath(extensionUri, 'media', 'main.js');
    const cssPathOnDisk = vscode.Uri.joinPath(extensionUri, 'media', 'main.css');

    // Convert the disk path to the appropriate URI for webviews
    const scriptUri = webview.asWebviewUri(scriptPathOnDisk);
    const cssUri = webview.asWebviewUri(cssPathOnDisk);

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <link href="${cssUri}" rel="stylesheet">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'unsafe-eval' 'unsafe-inline' ${webview.cspSource};">
    </head>
    <body>
        <div class="chat-container">
            <div id="messages" class="messages"></div>
            <div class="input-box">
                <textarea id="userInput" placeholder="Type your message here" onkeydown="handleKeyDown(event)"></textarea>
                <input type="file" id="fileInput" />
                <button onclick="sendMessage()">Send</button>
            </div>
        </div>
        <script src="${scriptUri}"></script>
    </body>
    </html>
    `;
}