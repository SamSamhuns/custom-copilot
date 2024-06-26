const vscode = acquireVsCodeApi();
let userMessages = [];
let llmResponses = [];
const SEP_TOKEN = '<CHAT_SEP>';


// handle key press down for the textarea input
function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault(); // Prevent default Enter behavior which is to add a new line
        if (document.getElementById('userInput').value.trim() !== '') {
            sendMessage(); // Only send if there's something other than whitespace
            document.getElementById('userInput').value = ''; // Clear the textarea after sending
        }
    }
    // If Shift+Enter is pressed, allow the default action of inserting a new line
}

function appendMessage(message, sender) {
    const messagesContainer = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.textContent = sender + ': ' + message;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to the bottom
    if (sender === 'You') {
        userMessages.push(message); // Append to user messages
    } else {
        llmResponses.push(message); // Append to LLM responses
    }
}

function sendMessage() {
    const input = document.getElementById('userInput').value;
    const fileInput = document.getElementById('fileInput');

    function sendToLLM(text) {
        // Alternatively add user & llm msgs to send to llm again
        const combinedMessages = [];
        const maxLen = Math.max(userMessages.length, llmResponses.length);
        for (let i = 0; i < maxLen; i++) {
            if (userMessages[i]) { combinedMessages.push('You: ' + userMessages[i] + SEP_TOKEN);};
            if (llmResponses[i]) { combinedMessages.push('LLM: ' + llmResponses[i] + SEP_TOKEN);};
        }
        combinedMessages.push('You: ' + text); // Add current message
        vscode.postMessage({ command: 'send', text: combinedMessages.join('\n') }); // Send combined messages
    }

    if (fileInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const fileContent = event.target.result;
            const finalMessage = input + "\n\n" + fileContent;
            sendToLLM(finalMessage);
            appendMessage(input + ' (with file content)', 'You');
        };
        reader.readAsText(fileInput.files[0]);
    } else {
        sendToLLM(input);
        appendMessage(input, 'You');
    }

    document.getElementById('userInput').value = ''; // Clear text input
}

// Append LLM response to llmResponses
window.addEventListener('message', event => {
    const message = event.data;
    switch (message.command) {
        case 'response':
            appendMessage(message.text, 'LLM');
            break;
    }
});