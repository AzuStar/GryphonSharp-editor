import * as vscode from 'vscode';
import * as path from 'path';
import { Page } from './SiteBuilderUtilities';
import * as fs from 'fs';

export class NodeEditorProvider implements vscode.CustomTextEditorProvider {

    private context: vscode.ExtensionContext;

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
        fs.readdir(path.join(context.extensionPath, 'media', 'js'), (err, files) => {
            scripts = files;
        });
        fs.readdir(path.join(context.extensionPath, 'media', 'css'), (err, files) => {
            css = files;
        });
        var pg = new Page(path.join(context.extensionPath, 'media', 'index.htm'));
        var arr: string[] = [];
        scripts.forEach(element => {
            arr.push('<script nonce="${nonce}" src="${element}"></script>');
        });
        pg.FillReplace('styleUris', arr);
        return '<html></html>';
        // const scriptUri = webview.asWebviewUri(vscode.Uri.file(
        //     path.join(context.extensionPath, 'media', '')
        // ));
    }

}