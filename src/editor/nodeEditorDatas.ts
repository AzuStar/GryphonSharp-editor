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
export interface EditorState {
    schema: {
        nodeCount: number,
        dataCount: number,
        bgSizes: [number, number],
        bgPos: [number, number],
    };
    nodes: { [id: string]: NodeSignature };
}