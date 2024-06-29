import * as vscode from 'vscode';
import { ChatViewProvider } from './chatView';

let chatViewProvider: ChatViewProvider | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log('Anais chat extension is now active!');

  chatViewProvider = new ChatViewProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(ChatViewProvider.viewType, chatViewProvider)
  );

  let disposable = vscode.commands.registerCommand('anais.openChat', () => {
    vscode.commands.executeCommand('workbench.view.extension.anais');
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {
  if (chatViewProvider) {
    chatViewProvider.dispose();
  }
}