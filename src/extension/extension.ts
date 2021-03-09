import * as vscode from 'vscode';
import { NodeEditorProvider } from './NodeEditorProvider';
import fs from 'fs';


export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(NodeEditorProvider.registerProvider(context));
}

// this method is called when your extension is deactivated
export function deactivate() { }
