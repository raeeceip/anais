  import * as vscode from 'vscode';
  import { AIService } from './ai-service';

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

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${styleUri}" rel="stylesheet">
        <title>Anais Chat</title>
      </head>
      <body>
        <div id="chat-container"></div>
        <div id="input-container">
          <input type="text" id="user-input" placeholder="Type your message...">
          <button id="send-button">Send</button>
        </div>
        <script src="${scriptUri}"></script>
      </body>
      </html>
    `;
  }

  private _setWebviewMessageListener(webview: vscode.Webview) {
    webview.onDidReceiveMessage(
      (message: any) => {
        switch (message.command) {
          case 'sendMessage':
            this._handleUserMessage(message.text);
            return;
        }
      },
      null,
      this._disposables
    );
  }

  private async _handleUserMessage(text: string) {
    const response = await this._aiService.generateResponse(text);
    this._view?.webview.postMessage({ type: 'addMessage', content: response });
  }

  public dispose() {
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

}