import { LoadEvent } from "vscComTypes";
import { Webview } from "vscode";

// Communication schema is in README

window.addEventListener("message", async e => {
    switch (e.data.command) {
        case 'editor-load':
            VSCHost.eventLoadHandler(e.data);
    }
});

// This script is responsible for vscode communication

export class VSCHost {

    //@ts-ignore
    static vscode: Webview = acquireVsCodeApi();

    public static eventLoadHandler: (msg: LoadEvent) => void;

    public static sendReady() {
        VSCHost.vscode.postMessage({
            command: "vsc-ready",
        });
    }

    public static syncData(data: string) {
        VSCHost.vscode.postMessage({
            command: "vsc-sync",
            data: data,
        });
    }


}