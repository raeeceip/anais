# Anais - AI-Powered Coding Assistant

Anais is a VS Code extension that provides an AI-powered coding assistant using local language models through Ollama. It offers intelligent code analysis, suggestions, and a chat interface right within your development environment.

## Features

- **AI Chat Interface**: Engage in conversations with Anais about your code and development questions.
- **Code Analysis**: Select code in your editor and ask Anais to explain or suggest improvements.
- **Local Language Model Integration**: Powered by Ollama, ensuring privacy and customization.
- **Export Chat History**: Save your conversations for future reference.

![Anais in action](images/anais-demo.gif)

## Requirements

- Visual Studio Code v1.60.0 or higher
- Ollama installed on your local machine (see installation guide below)

## Installation

1. Install the Anais extension from the VS Code Marketplace.
2. Install Ollama on your local machine:
   - Visit [Ollama's official website](https://ollama.ai/)
   - Download and install the appropriate version for your operating system

## Configuration

To use Anais with your local Ollama server:

1. Start your Ollama server (it typically runs on `http://localhost:11434`)
2. In VS Code, go to File > Preferences > Settings
3. Search for "Anais"
4. Enter the URL of your Ollama server in the "Anais: Local Llm Url" field
   - Default is `http://localhost:11434`

## Usage

### Starting a Conversation

1. Open the Anais sidebar by clicking on the Anais icon in the activity bar.
2. Type your question or prompt in the input field at the bottom of the chat interface.
3. Press Enter or click the send button to submit your message.

### Analyzing Code

1. Select a portion of code in your editor.
2. Right-click and choose "Ask Anais about selection" from the context menu.
3. Anais will analyze the code and provide explanations or suggestions.

### Exporting Chat History

1. Use the command palette (Ctrl+Shift+P or Cmd+Shift+P) and search for "Anais: Export Chat History".
2. Choose a location to save the exported chat.

### Clearing Chat History

Use the command palette and search for "Anais: Clear Chat History" to start a fresh conversation.

## Extension Settings

This extension contributes the following settings:

- `anais.localLlmUrl`: URL for the local Ollama server (default: "http://localhost:11434")
- `anais.maxTokens`: Maximum number of tokens for AI responses (default: 300)

## Ollama Integration

Anais uses Ollama to run language models locally on your machine. Here's how it works:

1. Ollama provides a local API server that hosts various language models.
2. When you send a message, Anais forwards it to the Ollama server.
3. Ollama processes the message using the specified language model (default is Llama 3).
4. The response is sent back to Anais and displayed in the chat interface.

To use different models or customize Ollama's behavior, refer to the [Ollama documentation](https://github.com/jmorganca/ollama/tree/main/docs).

## Troubleshooting

- If Anais isn't responding, ensure your Ollama server is running (`ps aux | grep ollama` on Unix-based systems).
- Check the "Output" panel in VS Code and select "Anais" from the dropdown for any error messages.
- Verify that the Ollama URL in Anais settings matches your Ollama server address.

## Known Issues

- Large code selections may take longer to process due to token limitations.
- Some complex code structures might not be analyzed accurately.

## Release Notes

### 1.0.0

Initial release of Anais:
- Basic chat functionality
- Code analysis feature
- Integration with local Ollama server
- Export and clear chat history

---

## Contributing

We welcome contributions to Anais! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) file for details on how to get involved.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

**Enjoy coding with Anais!**