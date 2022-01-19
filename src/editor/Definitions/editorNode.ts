export class NENode {
    public readonly konvaId: string;
    public readonly numbericId : number;
    constructor(nodeId: number) {
        this.konvaId = "node-"+nodeId;
        this.numbericId = nodeId;
    }
    // /**
    //  * UpdateState
    //  */
    // public UpdatePosition(): void {

    // }
}