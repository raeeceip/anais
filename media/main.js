hljs.initHighlightingOnLoad();
(function() {
    const vscode = acquireVsCodeApi();
    const chatContainer = document.getElementById('chat-container');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const loadingIndicator = document.getElementById('loading-indicator');

    // Restore previous state
    const state = vscode.getState() || { messages: [] };
    state.messages.forEach(message => addMessageToChat(message.content, message.isUser, message.isMarkdown, message.isError));

    function addMessageToChat(content, isUser = false, isFormatted = false, isError = false) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        if (isError) messageElement.classList.add('error-message');
        
        if (isFormatted) {
            messageElement.innerHTML = content;
        } else {
            messageElement.textContent = content;
        }
        
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    
        // Update state
        const state = vscode.getState() || { messages: [] };
        state.messages.push({ content, isUser, isFormatted, isError });
        vscode.setState(state);
    }
    

    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addMessageToChat(message, true);
            vscode.postMessage({ command: 'sendMessage', text: message });
            userInput.value = '';
            setLoading(true);
        }
    }

    function setLoading(isLoading) {
        loadingIndicator.style.display = isLoading ? 'block' : 'none';
        userInput.disabled = isLoading;
        sendButton.disabled = isLoading;
    }

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !userInput.disabled) sendMessage();
    });

    window.addEventListener('message', event => {
        const { type, content, isMarkdown, isError, isLoading } = event.data;
        switch (type) {
            case 'addMessage':
                addMessageToChat(content, false, isMarkdown, isError);
                setLoading(false);
                break;
            case 'setLoading':
                setLoading(isLoading);
                break;
            case 'clearChat':
                chatContainer.innerHTML = '';
                state.messages = [];
                vscode.setState(state);
                break;
            case 'exportChat':
                const chatHistory = Array.from(chatContainer.children)
                    .map(msg => `${msg.classList.contains('user-message') ? 'User' : 'Anais'}: ${msg.textContent}`)
                    .join('\n\n');
                vscode.postMessage({ command: 'exportChat', text: chatHistory });
                break;
                
        }
    });

const autoCompleteList = document.createElement('ul');
autoCompleteList.id = 'auto-complete-list';
autoCompleteList.style.display = 'none';
document.body.appendChild(autoCompleteList);

userInput.addEventListener('input', debounce(handleInput, 300));

function handleInput() {
    const inputText = userInput.value.trim();
    if (inputText.length < 3) {
        autoCompleteList.style.display = 'none';
        return;
    }

    const suggestions = getSuggestions(inputText);
    if (suggestions.length > 0) {
        showAutoComplete(suggestions);
    } else {
        autoCompleteList.style.display = 'none';
    }
}

function getSuggestions(inputText) {
    return state.messages
        .filter(msg => msg.isUser && msg.content.toLowerCase().startsWith(inputText.toLowerCase()))
        .map(msg => msg.content)
        .slice(0, 5);
}

function showAutoComplete(suggestions) {
    autoCompleteList.innerHTML = '';
    suggestions.forEach(suggestion => {
        const li = document.createElement('li');
        li.textContent = suggestion;
        li.addEventListener('click', () => {
            userInput.value = suggestion;
            autoCompleteList.style.display = 'none';
        });
        autoCompleteList.appendChild(li);
    });
    autoCompleteList.style.display = 'block';
}

function debounce(func, delay) {
    let debounceTimer;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
}
})();