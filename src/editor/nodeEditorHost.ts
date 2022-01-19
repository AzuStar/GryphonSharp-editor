import Konva from "konva";
import { NE_BODY_PANEL_COLOR, NE_BODY_PANEL_OPACITY, NE_CONNECTOR_PAD_HORIZONTAL, NE_CONNECTOR_PAD_TOP, NE_CONNECTOR_RADIUS, NE_CONNECTOR_TXT_FONT_SIZE, NE_CONNECTOR_TXT_WIDTH, NE_CONTEXT_ELEMNT_PAD, NE_CONTEXT_HEADER_PAD, NE_FONT_FAMILY, NE_METHOD_PANEL_OPACITY, NE_METHOD_TXT_FONT_SIZE, NE_METHOD_TXT_PAD_BOT, NE_METHOD_TXT_PAD_LEFT, NE_PANEL_WIDTH, NE_STAGE } from "./nodeEditorConst";
import { CodeNodeType, EditorState, CodeSignature } from "./Definitions/rawEditorState";
import { DragState, FocusState, INodeEditor } from "./Definitions/editorHostAPI";
import { VSCShell } from "./vscShell";
import { Utils } from "./utils";
import { Vector2d } from "konva/lib/types";
import { Node } from "konva/lib/Node";
import { Shape } from "konva/lib/Shape";
import { Text } from "konva/lib/shapes/Text";
import { CodeNodeFactory } from "./Factories/codeNodeFactory";
import { EditorStateWrapper } from "./Definitions/editorStateWrapper";


export class EditorStage implements INodeEditor {
    public stage = new Konva.Stage({
        container: 'editor-main',
        draggable: true,
    });
    public contextMenu = new Konva.Group({
        width: NE_PANEL_WIDTH,
        height: NE_PANEL_WIDTH * 2,
        // visible: false
    });
    public nodeLayer = new Konva.Layer();
    public connectionLayer = new Konva.Layer();
    public testLayer = new Konva.Layer();
    // code state
    public state: EditorStateWrapper = new EditorStateWrapper();

    public focusState: FocusState = FocusState.NONE;
    public dragState: DragState = DragState.NONE;
    // Vars for dragging
    public connectorDragLine: Konva.Line | undefined;
    public overConnector: Konva.Circle | undefined;
    public connectorDragSource: Konva.Circle | undefined;

    public nodeFactory: CodeNodeFactory = new CodeNodeFactory();

    constructor() {
        // Ill get back to it
        //#region Context Menu

        // var elementList = new Konva.Group({
        //     width: this.contextMenu.width(),
        //     height: this.contextMenu.width() * 2 - NE_CONTEXT_HEADER_PAD,
        //     y: NE_CONTEXT_HEADER_PAD
        // });

        // this.contextMenu.add(elementList);

        // var element1 = new Konva.Text({
        //     y: NE_CONTEXT_ELEMNT_PAD,
        //     text: 'New Call',
        //     fontSize: NE_METHOD_TXT_FONT_SIZE,
        //     fontFamily: 'Calibri',
        //     align: 'left',
        //     // x: NE_METHOD_TXT_PAD_NE_LEFT / 2,
        //     ellipsis: true,
        //     width: NE_PANEL_WIDTH,
        //     height: NE_CONTEXT_HEADER_PAD,
        //     wrap: 'none'
        // });

        // elementList.add(element1);
        // this.nodeLayer.add(this.contextMenu);
        //#endregion


        // Internal finalized events
        this.stage.add(this.testLayer);
        this.stage.add(this.nodeLayer);
        this.stage.add(this.connectionLayer);
        this.stage.on('dragend', (e) => {
        });
        this.nodeLayer.add(this.contextMenu);
        VSCShell.eventSyncHandler = (msg) => {
            if (msg.data != null)
                try {
                    this.setState(JSON.parse(msg.data));
                } catch (err) {
                    console.error(err);
                }
            else console.log("Initializing new document...");
        };
    }
    public destroyNode(id: number): void {
        this.state.destroyCodeNode(id);
    }
    //#region State Functions
    public setState(jsonState: object) {
        this.state = new EditorStateWrapper(jsonState);

        this.nodeLayer.destroyChildren();
        this.connectionLayer.destroyChildren();

        this.state.constructCodeNodes(this.nodeFactory, this);
    }
    //#endregion
    //#region INode API
    public newNode(signature: CodeSignature): void {
        this.state.newCodeNode(signature, this.nodeFactory, this);
    }

    public getMousePosition(): Vector2d {
        var vect = this.stage.getPointerPosition()!;
        vect.x -= this.stage.position().x;
        vect.y -= this.stage.position().y;
        return vect;
    }
    public getRelativePosition(vec: Vector2d): Vector2d {
        vec.x -= this.stage.position().x;
        vec.y -= this.stage.position().y;
        return vec;
    }
    //#endregion

    public dropFocusState() {
        if (this.focusState == FocusState.NONE)
            return;

        switch (this.focusState) {
            case FocusState.CONTEXT:

        }
        this.focusState = FocusState.NONE;
    }

    public dropDragState() {

    }

    //#region Privates

    //#endregion




}