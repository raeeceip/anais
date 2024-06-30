import * as vscode from 'vscode';
import { AIService } from './ai-service';
import * as marked from 'marked';

export class ChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'anais.chatView';

  private _view?: vscode.WebviewView;
  private _disposables: vscode.Disposable[] = [];
  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _aiService: AIService
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ): void | Thenable<void> {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        this._extensionUri
      ]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    this._setWebviewMessageListener(webviewView.webview);

    webviewView.onDidDispose(() => {
      this.dispose();
    }, null, this._disposables);
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'style.css'));
    const codiconUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'));
  
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${styleUri}" rel="stylesheet">
        <link href="${codiconUri}" rel="stylesheet">
        <title>Anais Chat</title>
      </head> 
      <body>
        <div id="chat-container"></div>
        <div id="loading-indicator" style="display: none;">Anais is thinking...</div>
        <div id="input-container">
          <input type="text" id="user-input" placeholder="Type your message...">
          <button id="send-button" class="codicon codicon-send"></button>
        </div>
        <script src="${scriptUri}"></script>
      </body>
      </html>
    `;
  }

  private _setWebviewMessageListener(webview: vscode.Webview) {
    webview.onDidReceiveMessage(
      async (message: any) => {
        switch (message.command) {
          case 'sendMessage':
            this._handleUserMessage(message.text);
            return;
          case 'exportChat':
            await this._exportChatHistory(message.text);
            return;
        }
      },
      null,
      this._disposables
    );
  }

  private async _handleUserMessage(text: string) {
    this._view?.webview.postMessage({ type: 'setLoading', isLoading: true });
    try {
      const response = await this._aiService.generateResponse(text);
      const htmlResponse = marked.parse(response);
      this._view?.webview.postMessage({ type: 'addMessage', content: htmlResponse, isMarkdown: true });
    } catch (error) {
      console.error('Error in AI response:', error);
      this._view?.webview.postMessage({ 
        type: 'addMessage', 
        content: "I'm sorry, I encountered an error while processing your request.",
        isError: true
      });
    } finally {
      this._view?.webview.postMessage({ type: 'setLoading', isLoading: false });
    }
  }

  private async _exportChatHistory(chatHistory: string) {
    const uri = await vscode.window.showSaveDialog({
      filters: { 'Text Files': ['txt'] }
    });
    
    if (uri) {
      try {
        await vscode.workspace.fs.writeFile(uri, Buffer.from(chatHistory, 'utf8'));
        vscode.window.showInformationMessage('Chat history exported successfully!');
      } catch (error) {
        vscode.window.showErrorMessage('Failed to export chat history.');
        console.error('Error exporting chat history:', error);
      }
    }
  }

  public dispose() {
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  public askAboutCode(code: string) {
    const prompt = `Analyze the following code:\n\n${code}\n\nExplain what this code does and suggest any improvements.`;
    this._handleUserMessage(prompt);
  }

  public clearChat() {
    this._view?.webview.postMessage({ type: 'clearChat' });
  }

  public exportChat() {
    this._view?.webview.postMessage({ type: 'exportChat' });
  }
}