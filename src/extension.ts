import * as vscode from 'vscode';
import { ChatViewProvider } from './chatView';
import { AIService } from './ai-service';

let aiService: AIService;

export function activate(context: vscode.ExtensionContext) {
  console.log('Activating Anais extension');

  const localLlmUrl = vscode.workspace.getConfiguration().get('anais.localLlmUrl') as string || 'http://localhost:11434';
  
  if (!localLlmUrl) {
    vscode.window.showErrorMessage('Anais local LLM URL not set. Please set it in settings.');
    return;
  }

  console.log('Using LLM URL:', localLlmUrl);
  aiService = new AIService(localLlmUrl);

  const chatViewProvider = new ChatViewProvider(context.extensionUri, aiService);

  // Register the webview provider with the option to retain context
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      ChatViewProvider.viewType,
      chatViewProvider,
      {
        webviewOptions: { retainContextWhenHidden: true }
      }
    )
  );

  // Register command to ask about selected code
  let askAboutSelectionDisposable = vscode.commands.registerCommand('anais.askAboutSelection', () => {
    console.log('Executing askAboutSelection command');
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const selection = editor.selection;
      const text = editor.document.getText(selection);
      if (text) {
        chatViewProvider.askAboutCode(text);
      } else {
        vscode.window.showInformationMessage('No text selected. Please select some code and try again.');
      }
    } else {
      vscode.window.showInformationMessage('No active text editor. Please open a file and select some code.');
    }
  });

  // Register command to clear chat
  let clearChatDisposable = vscode.commands.registerCommand('anais.clearChat', () => {
    console.log('Executing clearChat command');
    chatViewProvider.clearChat();
  });

  // Register command to export chat
  let exportChatDisposable = vscode.commands.registerCommand('anais.exportChat', () => {
    console.log('Executing exportChat command');
    chatViewProvider.exportChat();
  });
  
  // Add all disposables to the context subscriptions
  context.subscriptions.push(
    askAboutSelectionDisposable,
    clearChatDisposable,
    exportChatDisposable
  );

  console.log('Anais extension activated');
}

export function deactivate() {
  console.log('Deactivating Anais extension');
}