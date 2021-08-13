import * as vscode from 'vscode';
import * as path from 'path';
import { Page } from './SiteBuilderUtilities';
import * as fs from 'fs';

class CommunicationStrcut {
    command!: string;
    data?: string;
}

// comment this
export class NodeEditorProvider implements vscode.CustomTextEditorProvider {

    public context: vscode.ExtensionContext;

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




        // communication
        function messageHandler(message: CommunicationStrcut) {
            switch (message.command) {
                case 'vsc-ready':
                    syncDocument(document);
                    return;
                case 'vsc-sync':
                    const edit = new vscode.WorkspaceEdit();
                    edit.replace(document.uri,
                        new vscode.Range(0, 0, document.lineCount, 0),
                        message.data!); // change this to replace parts not whole thing
                    vscode.workspace.applyEdit(edit);
                    return;
            }
        }

        function sendMessage(message: CommunicationStrcut) {
            webviewPanel.webview.postMessage({
                command: message.command,
                data: message.data
            });
        }

        function syncDocument(text: vscode.TextDocument) {
            sendMessage({
                command: 'editor-sync',
                data: text.getText()
            });
        }

        // function loadDocument(text: vscode.TextDocument) {
        //     sendMessage({
        //         command: 'editor-load',
        //         data: text.getText()
        //     });
        // }

        webviewPanel.webview.onDidReceiveMessage(message => {
            messageHandler(message);
        }, undefined, this.context.subscriptions);


        const syncSaveChangesSubscription = vscode.workspace.onDidSaveTextDocument(e => {
            if (e.uri.toString() == document.uri.toString()) {
                syncDocument(document);
            }
        });

        const syncWorkbenchChangesSubscription = vscode.workspace.onDidChangeTextDocument(e=>{
            if(e.document.uri.toString() == document.uri.toString())
            {
                syncDocument(document);
            }
        });


        webviewPanel.onDidDispose(() => {
            syncSaveChangesSubscription.dispose();
            syncWorkbenchChangesSubscription.dispose();
        });






    }

    // private updateTextDocument(document: vscode.TextDocument, ){
    // }

    scriptsPath: string;
    cssPath: string;

    GenerateWebview(webview: vscode.Webview, context: vscode.ExtensionContext): string {
        var css: string[] = [];
        var scriptlibs: string[] = [];
        const nonce = NodeEditorProvider.getNonce();

        scriptlibs = fs.readdirSync(path.join(context.extensionPath, 'webStatic', 'jslib'));
        css = fs.readdirSync(this.cssPath);
        var pg = new Page(path.join(context.extensionPath, 'webStatic', 'index.htm'));
        var arrlibs: string[] = [];
        var cssarr: string[] = [];

        scriptlibs.forEach(element => {
            if (element.split('.').pop() == 'js')
                arrlibs.push(`<script nonce="${nonce}" data-main="scripts/main" src="${webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'webStatic', 'jslib', element))}"></script>`);
        });

        css.forEach(element => {
            if (element.split('.').pop() == 'css')
                cssarr.push(`<link href="${webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'webStatic', 'css', element))}" rel="stylesheet" />`);
        });
        pg.fillReplace('styleUris', cssarr);
        pg.fillReplace('scriptLibsUris', arrlibs);
        pg.replace('editorScript', `<script nonce="${nonce}" type="module" src="${webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'webStatic', 'js', 'editor.js'))}"></script>`);
        pg.replace('nonce', nonce);
        pg.replace('cspSource', webview.cspSource);
        var page = pg.getCompiledHTML();
        fs.writeFile(path.join(context.extensionPath, 'out', 'index.html'), page, () => { });
        return page;

    }

}