import { ICodeNodeFactory } from "../Factories/codeNodeFactory";
import { EditorStage } from "../nodeEditorHost";
import { Utils } from "../utils";
import { VSCShell } from "../vscShell";
import { CodeNodeType, DataSignature, EditorState, NodeSignature } from "./rawEditorState";

export class EditorStateWrapper {

    private state: EditorState = new EditorState();

    constructor();
    constructor(jsonObject: object);
    constructor(jsonObject?: object) {
        if (jsonObject != null) {
            //@ts-ignore
            this.state = Utils.deserializeRecursive(this.state, jsonObject);
            // set internal ids
            for (const id in this.state.codeNodes)
                this.state.codeNodes[id].id = parseInt(id);
            for (const id in this.state.dataNodes)
                this.state.dataNodes[id].id = parseInt(id);
        }
    }

    private syncState() {
        VSCShell.syncData(JSON.stringify(this.state));
    }

    public constructCodeNodes(codeNodeFactory: ICodeNodeFactory, editor: EditorStage) {
        for (const id in this.state.codeNodes) {
            codeNodeFactory.createNode(this.state.codeNodes[id], editor);
        }
    }
    public destroyCodeNode(codeNodeId: number) {
        const node = this.state.codeNodes[codeNodeId];
        switch (node.type) {
            case CodeNodeType.primitiveValue:

                break;
            default:
                break;

        }
        delete this.state.codeNodes[codeNodeId];
    }

    public getHighestCodeIndex(): number {
        return parseInt(Object.keys(this.state.codeNodes)[Object.keys(this.state.codeNodes).length - 1]);
    }

    public getOutputDataNodes(): DataSignature[] {
        return [];
    }

    public getInputDataNodes(): DataSignature[] {
        return [];
    }

    public getCreatedDataNode(codeNodeId: number): DataSignature {
        return this.state.dataNodes[this.state.codeNodes[codeNodeId].dataReference!];
    }

    public getDataNodeById(dataNodeId: number): DataSignature {
        return this.state.dataNodes[dataNodeId];
    }

    public getCodeNodeById(codeNodeId: number): NodeSignature {
        return this.state.codeNodes[codeNodeId];
    }
    public getCodeNodeByStringId(codeNodeId: string): NodeSignature {
        return this.state.codeNodes[parseInt(codeNodeId)];
    }

    //#region Setters
    // These would call sync events
    public setCreatedDataNodeValue(codeNodeId: number, value: number | boolean | string) {
        this.state.dataNodes[this.state.codeNodes[codeNodeId].dataReference!].value = value;
        this.syncState();
    }

    public setCodeNode(replaceId: number, signature: NodeSignature) {
        this.state.codeNodes[replaceId] = signature;
        this.syncState();
    }

    public setDataNode(replaceId: number, signature: DataSignature) {
        this.state.dataNodes[replaceId] = signature;
        this.syncState();
    }
    //#endregion
}