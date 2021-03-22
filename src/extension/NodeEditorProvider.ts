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
        this.scriptsPath = path.join(context.extensionPath, 'out', 'src', 'editor');
        this.cssPath = path.join(context.extensionPath, 'media', 'css');
    }

    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        token: vscode.CancellationToken): Promise<void> {
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'media'), vscode.Uri.joinPath(this.context.extensionUri, 'out', 'src', 'editor')]
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

    scriptsPath: string;
    cssPath: string;


    Main(webview: vscode.Webview, context: vscode.ExtensionContext): string {
        var scripts: string[] = [];
        var css: string[] = [];
        var scriptlibs: string[] = [];
        const nonce = NodeEditorProvider.getNonce();

        scriptlibs = fs.readdirSync(path.join(context.extensionPath, 'media', 'jslib'));
        scripts = fs.readdirSync(this.scriptsPath);
        css = fs.readdirSync(this.cssPath);
        var pg = new Page(path.join(context.extensionPath, 'media', 'index.htm'));
        var arr: string[] = [];
        var arrlibs: string[] = [];
        var cssarr: string[] = [];

        scriptlibs.forEach(element => {
            if (element.split('.').pop() === 'js')
                arrlibs.push(`<script nonce="${nonce}" src="${webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'media', 'jslib', element))}"></script>`);
        });

        scripts.forEach(element => {
            if (element.split('.').pop() === 'js') {
                var content: string, regex: RegExp, match, group;
                content = fs.readFileSync(path.join(this.scriptsPath, element), 'utf-8');
                content = content.replace(/([^\n]+\n){5}/m, "");
                regex = new RegExp(/const (\w+) ?= ?__importDefault\(require\(\"(\w+)\"\)\);/gm);
                match = content.match(regex);
                if (match !== null) {
                    match.forEach(element => {
                        group = element.match(/const (\w+) ?= ?__importDefault\(require\(\"(\w+)\"\)\);/m);
                        if (group !== null) {
                            content = content.replace(new RegExp(group[1] + ".default", "g"), group[2]);
                            content = content.replace(element, "");
                        }
                        content = content.replace(element, "");
                    });

                }
                content = content.replace(/\/\/! *pars-ignore\n[^\n]+/gm, "");

                arr.push(`<script nonce="${nonce} ">${content}</script>`);
            }
        });

        css.forEach(element => {
            if (element.split('.').pop() === 'css')
                cssarr.push(`<link href="${webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'media', 'css', element))}" rel="stylesheet" />`);
        });
        pg.fillReplace('scriptUris', arr);
        pg.fillReplace('styleUris', cssarr);
        pg.fillReplace('scriptLibsUris', arrlibs);
        pg.replace('nonce', nonce);
        pg.replace('cspSource', webview.cspSource);
        var page = pg.getCompiledHTML();
        fs.writeFile(path.join(context.extensionPath, 'out', 'index.htm'), page, () => { });
        return pg.getCompiledHTML();

    }

}