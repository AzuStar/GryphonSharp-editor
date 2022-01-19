import * as vscode from 'vscode';
import { Disposable, InputBoxOptions } from 'vscode';
import { NodeEditorProvider } from './NodeEditorProvider';
//t
export function activate(context: vscode.ExtensionContext) {
    var disposables: Disposable[] = [];

    // register any commands
    disposables.push(vscode.commands.registerCommand('gs.test', () => {

        NodeEditorProvider.currentWebViewPanel?.webview.postMessage({
            command: "editor-test",
        });



    }));

    context.subscriptions.push(NodeEditorProvider.registerProvider(context));

    for (const i in disposables)
        context.subscriptions.push(disposables[i]);
}

// this method is called when your extension is deactivated
export function deactivate() { }
