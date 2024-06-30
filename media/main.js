(function() {
    const vscode = acquireVsCodeApi();
    const chatContainer = document.getElementById('chat-container');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Restore previous state
    const previousState = vscode.getState() || { messages: [] };
    previousState.messages.forEach(message => addMessageToChat(message.content, message.isUser));
    function addMessageToChat(message, isUser = false, isMarkdown = false, isError = false) {
        const messageElement = document.createElement('div');
        messageElement.className = isUser ? 'message user-message' : 'message ai-message';
        if (isError) {
            messageElement.classList.add('error-message');
        }
        
        if (isMarkdown) {
            messageElement.innerHTML = message;
        } else {
            messageElement.textContent = message;
        }
        
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    
        // Update state
        const state = vscode.getState() || { messages: [] };
        state.messages.push({ content: message, isUser, isMarkdown, isError });
        vscode.setState(state);
    }

    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addMessageToChat(message, true);
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
                addMessageToChat(message.content, false, message.isMarkdown, message.isError);
                break;
            case 'setLoading':
                setLoading(message.isLoading);
                break;
        }
    });
})();