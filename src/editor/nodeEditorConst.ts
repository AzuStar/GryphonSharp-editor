import Konva from "konva";
import { EditorFuncs } from "nodeEditorFuncs";
import { VSCHost } from "vscHost";

export class NodeSignature {
    //#region Non-nulls
    x!: number;
    y!: number;
    type!: number;
    //#endregion
    reference?: string;
    target?: string;
    inputs?: ConnectorSignature[];
    outputs?: ConnectorSignature[];
}
export class ConnectorSignature {
    name!: string;
    data!: number;

}

interface EditorState {
    schema: {
        nodeCount: number,
        dataCount: number,
        bgSizes: [number, number],
    };
    nodes: { [id: string]: NodeSignature }
}

export class EditorStage {
    private _stage = new Konva.Stage({
        container: 'editor-main',
        draggable: true,
    });
    public get stage() {
        return this._stage;
    }
    private layer = new Konva.Layer();
    // code state
    public state: EditorState = {
        schema: {
            nodeCount: 0,
            dataCount: 0,
            bgSizes: [100, 20]
        },
        nodes: {}
    }


    constructor() {
        this.stage.add(this.layer);
    }

    public setSyncState(jsonState: EditorState) {
        this.state = jsonState;
        for(const id in this.state.nodes)
        {
            EditorFuncs.CreateNode(this.state.nodes[id]);
        }
    }
    public getSyncState() {
        return JSON.stringify(this.state);
    }

    public addNode(nodeGroup: Konva.Group, signature: NodeSignature) {
        this.layer.add(nodeGroup)
        this.state.nodes[this.state.schema.nodeCount] = signature;
        nodeGroup.id("node-" + this.state.schema.nodeCount++);
    }

    public nodeUpdateState(nodeGroup: Konva.Group) {
        var signature = this.state.nodes[nodeGroup.id().split("-")[1]];

        signature.x = nodeGroup.x();
        signature.y = nodeGroup.y();

        this.state.nodes[nodeGroup.id().split("-")[1]] = signature;
        VSCHost.syncData(NE_STAGE.getSyncState());
    }




}

// Actual constants
export const NE_PANEL_WIDTH = 150;
export const NE_CONTEXT_HEADER_PAD = 20;
export const NE_CONTEXT_ELEMNT_PAD = 20;
export const NE_METHOD_TXT_PAD_LEFT = 15;
export const NE_CONNECTOR_PAD_HORIZONTAL = 10;
export const NE_METHOD_TXT_PAD_BOT = 10;
export const NE_METHOD_TXT_FONT_SIZE = 16;
export const NE_CONNECTOR_TXT_FONT_SIZE = 13;
export const NE_CONNECTOR_TXT_WIDTH = NE_PANEL_WIDTH / 3;
export const NE_CONNECTOR_RADIUS = 4.5;
export const NE_CONNECTOR_PAD_TOP = 8;
export const NE_BODY_PANEL_COLOR = '#ffffff';
export const NE_METHOD_PANEL_OPACITY = 1;//0.6;
export const NE_BODY_PANEL_OPACITY = 1;//0.4;
export const NE_FONT_FAMILY = 'Arial';
export const NE_SCALE_STRENGTH = 1.03;

export const NE_STAGE = new EditorStage();