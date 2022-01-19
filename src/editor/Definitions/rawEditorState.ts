export enum CodeNodeType {
    executionEnter = 0,
    invokeInstanceCall = 1,
    primitiveValue = 2,
    invokeStaticCall = 3,
    invokeOperatorCall = 4,
    loop = 5,
    branch = 6,
    executionExit = 100,
}
export class NodeSignature {
    x!: number;
    y!: number;
    type!: CodeNodeType;

    // not null when type is primitiveValue 
    dataReference?: number;
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
    type!: number;
    value!: string | number | boolean;
}
export class EditorSchema {
}
export class EditorState {
    schema: EditorSchema = {
    };
    codeNodes: { [id: string]: NodeSignature; } = {};
    dataNodes: { [id: string]: DataSignature } = {};

}