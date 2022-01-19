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
    public static currentWebViewPanel: vscode.WebviewPanel | undefined;

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
            localResourceRoots: [
                vscode.Uri.joinPath(this.context.extensionUri, 'webStatic'),
                vscode.Uri.joinPath(this.context.extensionUri, 'out', 'editor')
            ]
        };

        webviewPanel.onDidChangeViewState((state) => {
            if (state)
                NodeEditorProvider.currentWebViewPanel = webviewPanel;
            else if (NodeEditorProvider.currentWebViewPanel == webviewPanel) NodeEditorProvider.currentWebViewPanel = undefined;
        });

        // communication
        function messageHandler(message: CommunicationStrcut): any {
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
                case 'vsc-pvalueChange':
                    vscode.window.showQuickPick(["Boolean", "String", "Number"], {
                        title: "Pick Primitive Type",
                    }).then((e) => {
                        switch (e) {
                            case "Boolean":
                                vscode.window.showQuickPick(["True", "False"], {
                                    title: "Pick Boolean Value"
                                }).then((e) => { pvalueChanged(e, parseInt(message.data!)); });
                                break;
                            case "String":
                                vscode.window.showInputBox({
                                    title: "Enter String Value",
                                }).then((e) => { pvalueChanged(e, parseInt(message.data!)); });
                                break;
                            case "Number":
                                vscode.window.showInputBox({
                                    title: "Enter Numeric Value",
                                    validateInput: (e) => {
                                        // vscode.window.showErrorMessage(``);
                                        return e.match(new RegExp("[+-]?[0-9]*\.?[0-9]+f?")) == null ? "Not a valid number!" : null;
                                    }
                                }).then((e) => { pvalueChanged(e != null ? parseFloat(e) : e, parseInt(message.data!)); });
                                break;
                        }

                    });
                    break;
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

        function pvalueChanged(value: string | undefined | number, id: number) {
            var text = JSON.parse(document.getText());
            text.dataNodes[id].value = value == undefined ? "" : value;
            const edit = new vscode.WorkspaceEdit();
            edit.replace(document.uri,
                new vscode.Range(0, 0, document.lineCount, 0),
                JSON.stringify(text)); // change this to replace parts not whole thing
            vscode.workspace.applyEdit(edit);
        }

        // function loadDocument(text: vscode.TextDocument) {
        //     sendMessage({
        //         command: 'editor-load',
        //         data: text.getText()
        //     });
        // }

        const messageListener = webviewPanel.webview.onDidReceiveMessage(message => {
            return messageHandler(message);
        });


        const syncSaveChangesSubscription = vscode.workspace.onDidSaveTextDocument(e => {
            if (e.uri.toString() == document.uri.toString()) {
                syncDocument(document);
            }
        });

        const syncWorkbenchChangesSubscription = vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.toString() == document.uri.toString()) {
                syncDocument(document);
            }
        });


        webviewPanel.onDidDispose(() => {
            syncSaveChangesSubscription.dispose();
            syncWorkbenchChangesSubscription.dispose();
            messageListener.dispose();

        });


        webviewPanel.webview.html = this.GenerateWebview(webviewPanel.webview, this.context);
    }

    scriptsPath: string;
    cssPath: string;

    // Build the page every time it is requested (for now), probably should change to debug/release version
    // debug will always recompile the page
    // release will always have precompiled webview
    GenerateWebview(webview: vscode.Webview, context: vscode.ExtensionContext): string {

        var css: string[] = [];
        const nonce = NodeEditorProvider.getNonce();

        css = fs.readdirSync(this.cssPath);
        var pg = new Page(path.join(context.extensionPath, 'webStatic', 'index.htm'));
        var cssarr: string[] = [];

        css.forEach(element => {
            if (element.split('.').pop() == 'css')
                cssarr.push(`<link href="${webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'webStatic', 'css', element))}" rel="stylesheet" />`);
        });
        pg.fillReplace('styleUris', cssarr);
        pg.replace('editorScript', `<script nonce="${nonce}" type="module" src="${webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'webStatic', 'js', 'editorBundle.js'))}"></script>`);
        pg.replace('nonce', nonce);
        pg.replace('cspSource', webview.cspSource);
        var page = pg.getCompiledHTML();
        fs.writeFile(path.join(context.extensionPath, 'out', 'index.html'), page, () => { });
        return page;

    }

}