import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { NodeSignature } from "./rawEditorState";

export interface INodeEditor {

    /**
     * Create a new node from a given signature.
     */
    newNode(signature: NodeSignature): void;

    destroyNode(id: number): void;
    destroyNode(signature: NodeSignature): void;

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