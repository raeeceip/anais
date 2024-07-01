
(function() {
    const vscode = acquireVsCodeApi();
    let chatContainer, userInput, sendButton, loadingIndicator, autoCompleteList;
    let state;

    function initializeChat() {
        console.log('Initializing chat');
        chatContainer = document.getElementById('chat-container');
        userInput = document.getElementById('user-input');
        sendButton = document.getElementById('send-button');
        loadingIndicator = document.getElementById('loading-indicator');
        autoCompleteList = document.createElement('ul');

        autoCompleteList.id = 'auto-complete-list';
        autoCompleteList.style.display = 'none';
        document.body.appendChild(autoCompleteList);

        // Restore previous state
        state = vscode.getState() || { messages: [] };
        state.messages.forEach(message => addMessageToChat(message.content, message.isUser, message.isFormatted, message.isError));

        sendButton.addEventListener('click', () => {
            console.log('Send button clicked');
            sendMessage();
        });

        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !userInput.disabled) {
                console.log('Enter key pressed');
                sendMessage();
            }
        });

        userInput.addEventListener('input', debounce(handleInput, 300));

        console.log('Chat initialized');
    }

    function addMessageToChat(content, isUser = false, isFormatted = false, isError = false) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        if (isError) messageElement.classList.add('error-message');
        
        if (isFormatted) {
            messageElement.innerHTML = content;
            messageElement.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightBlock(block);
            });
        } else {
            messageElement.textContent = content;
        }
        
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    
        // Update state
        state.messages.push({ content, isUser, isFormatted, isError });
        vscode.setState(state);
    }

    function sendMessage() {
        console.log('sendMessage function called');
        const message = userInput.value.trim();
        if (message) {
            console.log('Sending message:', message);
            addMessageToChat(message, true);
            vscode.postMessage({ command: 'sendMessage', text: message });
            userInput.value = '';
            setLoading(true);
        } else {
            console.log('Message is empty, not sending');
        }
    }

    function setLoading(isLoading) {
        loadingIndicator.style.display = isLoading ? 'block' : 'none';
        userInput.disabled = isLoading;
        sendButton.disabled = isLoading;
    }

    window.addEventListener('message', event => {
        const { type, content, isFormatted, isError, isLoading } = event.data;
        switch (type) {
            case 'addMessage':
                addMessageToChat(content, false, isFormatted, isError);
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

    // Initialize chat when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', initializeChat);
})();