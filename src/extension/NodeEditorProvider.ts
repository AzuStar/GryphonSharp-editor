import * as vscode from 'vscode';
import * as path from 'path';
import { Page } from './SiteBuilderUtilities';
import * as fs from 'fs';
import { MessageHandler } from './NodeEditorCommunication';

// comment this
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
        this.scriptsPath = path.join(context.extensionPath, 'out', 'editor');
        this.cssPath = path.join(context.extensionPath, 'webStatic', 'css');
    }

    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken):
        Promise<void> {

        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'webStatic'), vscode.Uri.joinPath(this.context.extensionUri, 'out', 'editor')]
        };

        webviewPanel.webview.html = this.GenerateWebview(webviewPanel.webview, this.context);

        webviewPanel.webview.onDidReceiveMessage(message => {
            MessageHandler(message);
        }, undefined, this.context.subscriptions);

        // function syncChanges() {
        //     webviewPanel.webview.postMessage({
        //         type: 'sync',
        //         text: document.getText(),
        //     });
        // }

        const syncChangesSubscription = vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.toString() == document.uri.toString()) {
                // syncChanges();
            }
        });

        webviewPanel.onDidDispose(() => {
            syncChangesSubscription.dispose();
        });

    }

    // private updateTextDocument(document: vscode.TextDocument, ){
    // }

    scriptsPath: string;
    cssPath: string;

    GenerateWebview(webview: vscode.Webview, context: vscode.ExtensionContext): string {
        var scripts: string[] = [];
        var css: string[] = [];
        var scriptlibs: string[] = [];
        const nonce = NodeEditorProvider.getNonce();

        scriptlibs = fs.readdirSync(path.join(context.extensionPath, 'webStatic', 'jslib'));
        scripts = fs.readdirSync(this.scriptsPath);
        css = fs.readdirSync(this.cssPath);
        var pg = new Page(path.join(context.extensionPath, 'webStatic', 'index.htm'));
        var arr: string[] = [];
        var arrlibs: string[] = [];
        var cssarr: string[] = [];

        scriptlibs.forEach(element => {
            if (element.split('.').pop() == 'js')
                arrlibs.push(`<script nonce="${nonce}" data-main="scripts/main" src="${webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'webStatic', 'jslib', element))}"></script>`);
        });

        scripts.forEach(element => {
            if (element.split('.').pop() == 'js') {
                var content: string;
                // content = fs.readFileSync(path.join(this.scriptsPath, element), 'utf-8');
                // content = content.replace(/^\/\/! *pars-ignore\n[^\n]+$/gm, "");

                // arr.push(`<script nonce="${nonce}" type="module">${content}</script>`);
                arr.push(`<script nonce="${nonce}" data-main="scripts/main" src="${webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'out', 'editor', element))}"></script>`);
            }
        });

        css.forEach(element => {
            if (element.split('.').pop() == 'css')
                cssarr.push(`<link href="${webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'webStatic', 'css', element))}" rel="stylesheet" />`);
        });
        pg.fillReplace('scriptUris', arr);
        pg.fillReplace('styleUris', cssarr);
        pg.fillReplace('scriptLibsUris', arrlibs);
        pg.replace('nonce', nonce);
        pg.replace('cspSource', webview.cspSource);
        var page = pg.getCompiledHTML();
        fs.writeFile(path.join(context.extensionPath, 'out', 'index.html'), page, () => { });
        return page;

    }

}