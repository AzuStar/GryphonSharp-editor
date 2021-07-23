import { HostInterface } from "vscHost";

export class Utils {

    public static Init() {
        console.log("prepost test");
        HostInterface.syncData("hi, my name is reggie");
    }
}