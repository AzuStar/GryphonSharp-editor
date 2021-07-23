import { VSCHost } from "vscHost";

export class Utils {

    public static Init() {
        console.log("prepost test");
        VSCHost.syncData("hi, my name is reggie");
    }
}