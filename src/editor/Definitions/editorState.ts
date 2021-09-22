import { Vector2d } from "konva/lib/types";

export class NodeSignature {

    //#region Non-nulls
    x!: number;
    y!: number;
    type!: number;
    //#endregion
    reference?: string;
    target?: string;
    execution?: number
    inputs?: ConnectorSignature[];
    outputs?: ConnectorSignature[];
}
export class ConnectorSignature {
    name!: string;
    dataType!: string;

}
export class DataSignature {
    dataType!: string;

}
export class EditorSchema {
    nodeCount!: number;
    dataCount!: number;
    bgSizes!: [number, number];
    stagePos!: Vector2d;

}
export class EditorState {
    schema: EditorSchema = {
        nodeCount: 0,
        dataCount: 0,
        bgSizes: [100, 20],
        stagePos: { x: 0, y: 0 },
    };
    nodes: { [id: string]: NodeSignature; } = {};
    datas: { [id: string]: DataSignature } = {};
    
}