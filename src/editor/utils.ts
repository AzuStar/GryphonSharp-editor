//! pars-ignore
import { HostInterface } from "./vscode";

export class Utils {

    public static Init() {
        console.log("prepost test");
        HostInterface.syncData("hi, my name is reggie");
    }
}