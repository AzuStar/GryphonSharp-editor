import { Webview } from "vscode";
import { LoadEvent, SyncEvent } from "./vscComTypes";

// Communication schema is in README

window.addEventListener("message", async e => {
    switch (e.data.command) {
        case 'editor-load':
            VSCShell.eventLoadHandler(e.data);
        case 'editor-sync':
            VSCShell.eventSyncHandler(e.data);
    }
});

// This script is responsible for vscode communication

export class VSCShell {

    //@ts-ignore
    static vscode: Webview = acquireVsCodeApi();

    public static eventLoadHandler: (msg: LoadEvent) => void;
    public static eventSyncHandler: (msg: SyncEvent) => void;

    public static sendReady() {
        VSCShell.vscode.postMessage({
            command: "vsc-ready",
        });
    }

    public static syncData(data: string) {
        VSCShell.vscode.postMessage({
            command: "vsc-sync",
            data: data,
        });
    }


}