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

  let disposable = vscode.commands.registerCommand('anais.openChat', () => {
    vscode.commands.executeCommand('workbench.view.extension.anais-sidebar');
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}