import Konva from "konva";
import { NE_BODY_PANEL_COLOR, NE_BODY_PANEL_OPACITY, NE_CONNECTOR_PAD_HORIZONTAL, NE_CONNECTOR_PAD_TOP, NE_CONNECTOR_RADIUS, NE_CONNECTOR_TXT_FONT_SIZE, NE_CONNECTOR_TXT_WIDTH, NE_CONTEXT_ELEMNT_PAD, NE_CONTEXT_HEADER_PAD, NE_FONT_FAMILY, NE_METHOD_PANEL_OPACITY, NE_METHOD_TXT_FONT_SIZE, NE_METHOD_TXT_PAD_BOT, NE_METHOD_TXT_PAD_LEFT, NE_PANEL_WIDTH } from "./nodeEditorConst";
import { EditorState, NodeSignature } from "./Definitions/editorState";
import { DragState, FocusState, INodeEditor } from "./Definitions/editorHostAPI";
import { VSCShell } from "./vscShell";
import { Utils } from "./utils";
import { Vector2d } from "konva/lib/types";


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
    private nodeLayer = new Konva.Layer();
    // code state
    public state: EditorState = new EditorState();

    public focusState: FocusState = FocusState.NONE;
    public dragState: DragState = DragState.NONE;
    // Vars for dragging
    public connectorDragLine: Konva.Line | undefined;
    public overConnector: Konva.Circle | undefined;
    public connectorDragSource: Konva.Circle | undefined;

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
        this.stage.add(this.nodeLayer);
        this.stage.on('dragend', (e) => {
            this.state.schema.stagePos = this.stage.position();
            VSCShell.syncData(this.getState());
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
    //#region State Functions
    public setState(jsonState: object) {
        this.state = new EditorState();
        //@ts-ignore
        this.state = this.deserializeRecursive(this.state, jsonState);
        this.nodeLayer.destroyChildren();
        for (const id in this.state.nodes) {
            this.createNode(this.state.nodes[id], parseInt(id));
        }
        this.stage.position({
            x: this.state.schema.stagePos[0],
            y: this.state.schema.stagePos[1]
        });
    }
    public getState() {
        return JSON.stringify(this.state);
    }

    public updateNodeState(nodeGroup: Konva.Group) {
        const nodeid = nodeGroup.id().split("-")[1];
        var signature = this.state.nodes[nodeid];

        // update position
        signature.x = nodeGroup.x();
        signature.y = nodeGroup.y();

        // update connections


        this.state.nodes[nodeid] = signature;
        VSCShell.syncData(this.getState());
    }
    //#endregion
    //#region INode API
    public newNode(signature: NodeSignature) {
        this.createNode(signature, Object.keys(this.state.nodes).length);
        VSCShell.syncData(this.getState());
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
    private deserializeRecursive(objLock: object, json: object): object {
        if (objLock == undefined) { // merge non existing keys
            objLock = json;
            return objLock
        }
        for (var prop in json) {
            if (typeof json[prop] == 'object') {
                objLock[prop] = this.deserializeRecursive(objLock[prop], json[prop]);
            } else if (typeof objLock[prop] == typeof json[prop]) {
                objLock[prop] = json[prop]
            }
        }
        return objLock;
    }

    private createNode(signature: NodeSignature, id: number) {
        this.state.nodes[id] = signature;
        var node = new Konva.Group({
            id: "node-" + id,
            x: signature.x,
            y: signature.y,
            draggable: true,
        });

        // var lineGroup = new Konva.Group();
        // node.add(lineGroup);

        node.on('mousedown', (e) => {
            var left = e.evt.button == 0;
            this.dropFocusState();
            this.dropDragState();
            if (this.overConnector) {
                this.dragState = DragState.CONNECT;
                node.draggable(false);
                this.connectorDragLine = new Konva.Line({
                    stroke: 'black',
                });
                this.nodeLayer.add(this.connectorDragLine);
                this.connectorDragSource = this.overConnector;
            } else
                node.draggable(left);
        });
        node.on('mouseup', (e) => {
            if (this.overConnector) {
                console.log(this.connectorDragLine);

            }
            else {
            }
        });
        node.on('dragend', (e) => {
            node.zIndex(0);
            this.updateNodeState(node);
        });
        node.on('dragstart', (e) => {
            node.zIndex(8);
        });

        var headGroup = new Konva.Group({
        });
        var methodReferenceText = new Konva.Text({
            y: NE_CONNECTOR_PAD_TOP / 2,
            text: signature.reference,
            fontSize: NE_METHOD_TXT_FONT_SIZE / 1.7,
            fontFamily: NE_FONT_FAMILY,
            align: 'left',
            x: NE_METHOD_TXT_PAD_LEFT / 3,
            ellipsis: true,
            width: NE_PANEL_WIDTH,
            height: NE_METHOD_TXT_FONT_SIZE,
            wrap: 'none',
            opacity: 0.9
        });
        var methodText = new Konva.Text({
            y: NE_CONNECTOR_PAD_TOP * 2,
            text: signature.target,
            fontSize: NE_METHOD_TXT_FONT_SIZE,
            fontFamily: NE_FONT_FAMILY,
            align: 'left',
            x: NE_METHOD_TXT_PAD_LEFT / 2,
            ellipsis: true,
            width: NE_PANEL_WIDTH,
            height: NE_METHOD_TXT_FONT_SIZE,
            wrap: 'none'
        });
        // I dont remember the reason to split them, oof
        // but most likely visual (different color etc)
        var methodNamePanel = new Konva.Rect({
            width: NE_PANEL_WIDTH,
            height: methodText.height() + methodText.y() + NE_METHOD_TXT_PAD_BOT,
            fill: NE_BODY_PANEL_COLOR,
            // cornerRadius: [6, 6, 0, 0],
            opacity: NE_METHOD_PANEL_OPACITY,
            // shadowOffset: {x: 2, y: 2},
            // shadowOpacity: 0.4,
            // shadowBlur: 14
        });

        headGroup.add(methodNamePanel);
        headGroup.add(methodReferenceText);
        headGroup.add(methodText);
        headGroup.height(methodNamePanel.height());

        var bodyGroup = new Konva.Group({
            y: headGroup.height(),

        });
        var bodyHeight = 20;
        if (signature.inputs != null)
            bodyHeight = signature.inputs.length * (NE_CONNECTOR_RADIUS * 2 + NE_CONNECTOR_PAD_TOP);
        if (signature.outputs != null) {
            var hee = signature.outputs.length * (NE_CONNECTOR_RADIUS * 2 + NE_CONNECTOR_PAD_TOP);
            if (bodyHeight < hee) bodyHeight = hee;
        }
        var bodyPanel = new Konva.Rect({
            width: NE_PANEL_WIDTH,
            height: bodyHeight,
            // cornerRadius: [0, 0, 6, 6],
            fill: NE_BODY_PANEL_COLOR,
            opacity: NE_BODY_PANEL_OPACITY,
            // shadowOffset: {x: 2, y: 2},
            // shadowOpacity: 0.4,
            // shadowBlur: 14,
        });
        bodyGroup.add(bodyPanel);

        //#region 
        // in connectors
        if (signature.inputs != null) {
            var connectorCircle: Konva.Circle, yOffset = NE_CONNECTOR_PAD_TOP, connectorText: Konva.Text;

            signature.inputs.forEach(element => {
                var connectorGroup = new Konva.Group({
                    y: yOffset,
                    x: NE_CONNECTOR_PAD_HORIZONTAL,
                });
                connectorText = new Konva.Text({
                    // y: -(NE_CONNECTOR_RADIUS + NE_CONNECTOR_PAD_TOP)/2,
                    text: element.name,
                    fontSize: NE_CONNECTOR_TXT_FONT_SIZE,
                    fontFamily: NE_FONT_FAMILY,
                    align: 'left',
                    x: NE_CONNECTOR_PAD_HORIZONTAL * 0.5 + NE_CONNECTOR_RADIUS * 2,
                    ellipsis: true,
                    width: NE_CONNECTOR_TXT_WIDTH,
                    height: NE_CONNECTOR_RADIUS * 1,
                    wrap: 'none',
                    offsetY: (NE_CONNECTOR_RADIUS + NE_CONNECTOR_PAD_TOP) / 2,
                    fill: '#000000'
                });
                connectorCircle = new Konva.Circle({
                    // x: NE_CONNECTOR_PAD_LEFT,
                    fill: '#cc0000',
                    radius: NE_CONNECTOR_RADIUS,
                    stroke: '#000000',
                    strokeWidth: 0.4,
                });
                yOffset += NE_CONNECTOR_RADIUS * 2 + NE_CONNECTOR_PAD_TOP;
                connectorCircle.on('mouseover', (e) => {
                    this.overConnector = connectorCircle;
                });
                // connectorCircle.on('mouseout', (e) => {
                //     this.overConnector = undefined;
                // });

                connectorGroup.add(connectorCircle);
                connectorGroup.add(connectorText);
                bodyGroup.add(connectorGroup);
            });
        }
        //#endregion

        //#region 
        // out connectors
        if (signature.outputs != null) {
            var connectorCircle: Konva.Circle, yOffset = NE_CONNECTOR_PAD_TOP, connectorText: Konva.Text;

            signature.outputs.forEach(element => {
                var connectorGroup = new Konva.Group({
                    y: yOffset,
                    x: NE_PANEL_WIDTH - NE_CONNECTOR_PAD_HORIZONTAL,
                });
                connectorText = new Konva.Text({
                    // y: -(NE_CONNECTOR_RADIUS + NE_CONNECTOR_PAD_TOP)/2,
                    text: element.name,
                    fontSize: NE_CONNECTOR_TXT_FONT_SIZE,
                    fontFamily: NE_FONT_FAMILY,
                    align: 'right',
                    x: - (NE_CONNECTOR_PAD_HORIZONTAL * 0.5 + NE_CONNECTOR_RADIUS * 2 + NE_CONNECTOR_TXT_WIDTH),
                    ellipsis: true,
                    width: NE_CONNECTOR_TXT_WIDTH,
                    height: NE_CONNECTOR_RADIUS * 1,
                    wrap: 'none',
                    offsetY: (NE_CONNECTOR_RADIUS + NE_CONNECTOR_PAD_TOP) / 2
                });
                connectorCircle = new Konva.Circle({
                    // x: NE_CONNECTOR_PAD_LEFT,
                    fill: '#cc00aa',
                    radius: NE_CONNECTOR_RADIUS,
                    stroke: '#000000',
                    strokeWidth: 0.4,
                });
                yOffset += NE_CONNECTOR_RADIUS * 2 + NE_CONNECTOR_PAD_TOP;
                connectorGroup.add(connectorCircle);
                connectorGroup.add(connectorText);
                bodyGroup.add(connectorGroup);
            });
        }
        //#endregion

        // node.on();

        node.add(headGroup);
        node.add(bodyGroup);
        var shad = new Konva.Rect({
            x: 0,
            y: 0,
            width: NE_PANEL_WIDTH,
            height: methodNamePanel.height() + bodyPanel.height(),
            shadowBlur: 14,
            shadowOpacity: 0.35,
            opacity: 1,
            fill: '#fff'
        });
        node.add(shad);
        shad.zIndex(0);
        this.nodeLayer.add(node)

    }
    //#endregion




}