import * as vscode from 'vscode';
import * as path from 'path';
import { Page } from './SiteBuilderUtilities';
import * as fs from 'fs';
import * as fse from 'fs-extra';

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
            localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'media')]
        };

        webviewPanel.webview.html = this.Main(webviewPanel.webview, this.context);

        webviewPanel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'test':
                    console.log("recieved");
                    return;
            }
        },
            undefined, this.context.subscriptions);
    }

    Main(webview: vscode.Webview, context: vscode.ExtensionContext): string {
        var scripts: string[] = [];
        var css: string[] = [];
        var scriptlibs: string[] = [];
        const nonce = NodeEditorProvider.getNonce();

        scriptlibs = fs.readdirSync(path.join(context.extensionPath, 'media', 'jslib'));
        scripts = fs.readdirSync(path.join(context.extensionPath, 'media', 'js'));
        css = fs.readdirSync(path.join(context.extensionPath, 'media', 'css'));
        var pg = new Page(path.join(context.extensionPath, 'media', 'index.htm'));
        var arr: string[] = [];
        var arrlibs: string[] = [];
        var cssarr: string[] = [];

        scriptlibs.forEach(element => {
            if (element.split('.').pop() === 'js')
                arrlibs.push(`<script nonce="${nonce}" src="${webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'media', 'jslib', element))}"></script>`);
        });

        scripts.forEach(element => {
            if (element.split('.').pop() === 'js')
                arr.push(`<script nonce="${nonce}" src="${webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'media', 'js', element))}"></script>`);
        });

        css.forEach(element => {
            if (element.split('.').pop() === 'css')
                cssarr.push(`<link href="${webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'media', 'css', element))}" rel="stylesheet" />`);
        });
        pg.FillReplace('scriptUris', arr);
        pg.FillReplace('styleUris', cssarr);
        pg.FillReplace('scriptLibsUris', arrlibs);
        pg.Replace('nonce', nonce);
        pg.Replace('cspSource', webview.cspSource);
        var page = pg.GetCompiledHTML();
        fs.writeFile(path.join(context.extensionPath, 'index.htm'), page, () => { });
        return pg.GetCompiledHTML();

    }

}