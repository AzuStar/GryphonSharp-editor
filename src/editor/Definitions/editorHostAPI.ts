import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { CodeSignature } from "./rawEditorState";

export interface INodeEditor {

    /**
     * Create a new node from a given signature.
     */
    newNode(signature: CodeSignature): void;

    destroyNode(id: number): void;

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