
import { Webview } from "vscode";

// This script is responsible for vscode communication

export class HostInterface {

    //@ts-ignore
    static const vscode : Webview = acquireVsCodeApi();

    public static syncData(data:string) {
        HostInterface.vscode.postMessage({
            command: "data-sync",
            data: data,
        });
    }

}