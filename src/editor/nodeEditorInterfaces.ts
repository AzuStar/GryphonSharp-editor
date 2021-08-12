import { NodeSignature } from "./nodeEditorDatas";

export interface INodeEditor {

    /**
     * Create a new node from a give signature.
     */
    newNode(signature: NodeSignature): void;
}