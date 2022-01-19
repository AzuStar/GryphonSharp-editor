import { JSONData, JsonIgnore } from "../jsonData";

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
export class NodeSignature extends JSONData {
    @JsonIgnore
    id!: number;
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
export class ConnectorSignature extends JSONData {
    name!: string;
    dataType!: string;
    dataReference!: number;
}
export class DataSignature extends JSONData {
    @JsonIgnore
    id!: number;
    type!: number;
    value!: string | number | boolean;
}
export class EditorSchema extends JSONData {
    ver!:number;
}
export class EditorState extends JSONData {
    schema: EditorSchema = new EditorSchema();
    codeNodes: { [id: string]: NodeSignature; } = {};
    dataNodes: { [id: string]: DataSignature } = {};

}