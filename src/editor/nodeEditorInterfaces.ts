import Konva from "konva";
import { NodeSignature } from "./nodeEditorDatas";

export interface INodeEditor {

    /**
     * Create a new node from a given signature.
     */
    newNode(signature: NodeSignature): void;

    /**
     * Retrieves node state and changes it accordigly.
    */
    updateNodeState(nodeGroup: Konva.Group): void;
}