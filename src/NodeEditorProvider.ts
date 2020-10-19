import * as vscode from 'vscode';
import * as path from 'path';
import { Page } from './SiteBuilderUtilities';
import * as fs from 'fs';

export class NodeEditorProvider implements vscode.CustomTextEditorProvider {

    private context: vscode.ExtensionContext;

    private static getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    public static registerProvider(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new NodeEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider('gsharp.nodeEditor', provider);
        return providerRegistration;

    }

    private constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        token: vscode.CancellationToken): Promise<void> {
        webviewPanel.webview.options = {
            enableScripts: true,
        };

        webviewPanel.webview.html = this.Main(webviewPanel.webview, this.context);
    }

    Main(webview: vscode.Webview, context: vscode.ExtensionContext): string {
        var scripts: string[] = [];
        var css: string[] = [];
        const nonce = NodeEditorProvider.getNonce();
        fs.readdir(path.join(context.extensionPath, 'media', 'js'), (err, files) => {
            scripts = files;
        });
        fs.readdir(path.join(context.extensionPath, 'media', 'css'), (err, files) => {
            css = files;
        });
        var pg = new Page(path.join(context.extensionPath, 'media', 'index.htm'));
        var arr: string[] = [];
        scripts.forEach(element => {
            arr.push(`<script nonce="${nonce}" src="${element}"></script>`);
        });
        var cssarr: string[] = [];
        css.forEach(element => {
            cssarr.push(`<link href="${element}" rel="stylesheet" />`);
        });
        pg.FillReplace('scriptUris', arr);
        pg.FillReplace('styleUris', cssarr);
        return pg.GetCompiledHTML();

        // const scriptUri = webview.asWebviewUri(vscode.Uri.file(
        //     path.join(context.extensionPath, 'media', '')
        // ));
    }

}