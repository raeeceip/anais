import * as vscode from 'vscode';
import { ChatViewProvider } from './chatView';
import { AIService } from './ai-service';

let aiService: AIService;

export function activate(context: vscode.ExtensionContext) {
  const localLlmUrl = vscode.workspace.getConfiguration().get('anais.localLlmUrl') as string || 'http://localhost:11434';
  
  if (!localLlmUrl) {
    vscode.window.showErrorMessage('Anais local LLM URL not set. Please set it in settings.');
    return;
  }

  aiService = new AIService(localLlmUrl);

  const chatViewProvider = new ChatViewProvider(context.extensionUri, aiService);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(ChatViewProvider.viewType, chatViewProvider)
  );

  let disposable = vscode.commands.registerCommand('anais.askAboutSelection', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const selection = editor.selection;
      const text = editor.document.getText(selection);
      if (text) {
        chatViewProvider.askAboutCode(text);
      }
    }
  });

  let clearChatDisposable = vscode.commands.registerCommand('anais.clearChat', () => {
    chatViewProvider.clearChat();
  });

  let exportChatDisposable = vscode.commands.registerCommand('anais.exportChat', () => {
    chatViewProvider.exportChat();
  });
  
  context.subscriptions.push(exportChatDisposable);
  context.subscriptions.push(clearChatDisposable);
  context.subscriptions.push(disposable);
}

export function deactivate() {}