import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { NodeSignature } from "./editorState";

export interface INodeEditor {

    /**
     * Create a new node from a given signature.
     */
    newNode(signature: NodeSignature): void;

    /**
     * Retrieves node state and changes it accordigly.
     */
    updateNodeState(nodeGroup: Konva.Group): void;

    /**
     * Retrieves mouse position relative to stage.
     */
     getRelativePosition(vector: Vector2d): Vector2d;
    /**
     *  Vector version
     */
    getMousePosition(): Vector2d;
}

export enum DragState {
    CONNECT, NONE
}

export enum FocusState {
    CONTEXT, NONE
}