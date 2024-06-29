(function() {
    const vscode = acquireVsCodeApi();
    const chatContainer = document.getElementById('chat-container');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    function addMessageToChat(message, isUser = false) {
        const messageElement = document.createElement('div');
        messageElement.className = isUser ? 'message user-message' : 'message anais-message';
        messageElement.textContent = message;
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addMessageToChat(`You: ${message}`, true);
            vscode.postMessage({
                command: 'sendMessage',
                text: message
            });
            userInput.value = '';
        }
    }

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.type) {
            case 'addMessage':
                addMessageToChat(message.content);
                break;
        }
    });
})();