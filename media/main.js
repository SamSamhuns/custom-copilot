const vscode = acquireVsCodeApi();

function handleEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent form submission if part of a form
        sendMessage();
    }
}

function appendMessage(message) {
    const messagesContainer = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to the bottom
}

function sendMessage() {
    const input = document.getElementById('userInput').value;
    const fileInput = document.getElementById('fileInput');

    function sendToLLM(text) {
        vscode.postMessage({ command: 'send', text: text });
    }

    if (fileInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const fileContent = event.target.result;
            const finalMessage = input + "\\n\\n" + fileContent;
            sendToLLM(finalMessage);
            appendMessage('You: ' + input + ' (with file content)');
        };
        reader.readAsText(fileInput.files[0]);
    } else {
        sendToLLM(input);
        appendMessage('You: ' + input);
    }

    document.getElementById('userInput').value = ''; // Clear text input
}

window.addEventListener('message', event => {
    const message = event.data;
    switch (message.command) {
        case 'response':
            appendMessage('LLM: ' + message.text);
            break;
    }
});