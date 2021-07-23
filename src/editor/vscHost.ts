import { Webview } from "vscode";

// This script is responsible for vscode communication

export class VSCHost {

    //@ts-ignore
    static const vscode : Webview = acquireVsCodeApi();

    public static syncData(data:string) {
        VSCHost.vscode.postMessage({
            command: "data-sync",
            data: data,
        });
    }

}