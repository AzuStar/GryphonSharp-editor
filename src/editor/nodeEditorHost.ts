import Konva from "konva";
import { NE_BODY_PANEL_COLOR, NE_BODY_PANEL_OPACITY, NE_CONNECTOR_PAD_HORIZONTAL, NE_CONNECTOR_PAD_TOP, NE_CONNECTOR_RADIUS, NE_CONNECTOR_TXT_FONT_SIZE, NE_CONNECTOR_TXT_WIDTH, NE_CONTEXT_ELEMNT_PAD, NE_CONTEXT_HEADER_PAD, NE_FONT_FAMILY, NE_METHOD_PANEL_OPACITY, NE_METHOD_TXT_FONT_SIZE, NE_METHOD_TXT_PAD_BOT, NE_METHOD_TXT_PAD_LEFT, NE_PANEL_WIDTH, NE_STAGE } from "./nodeEditorConst";
import { EditorState, NodeSignature } from "./nodeEditorDatas";
import { VSCShell } from "./vscShell";

export class EditorStage {
    public stage = new Konva.Stage({
        container: 'editor-main',
        draggable: true,
    });
    private nodeLayer = new Konva.Layer();
    // code state
    public state: EditorState = {
        schema: {
            nodeCount: 0,
            dataCount: 0,
            bgSizes: [100, 20],
            bgPos: [0, 0]
        },
        nodes: {}
    };


    constructor() {
        // Ill get back to it
        //#region Context Menu
        // var ContextMenu = new Konva.Group({
        //     width: NE_PANEL_WIDTH,
        //     height: NE_PANEL_WIDTH * 2,
        //     // visible: false
        // });

        // var elementList = new Konva.Group({
        //     width: ContextMenu.width(),
        //     height: ContextMenu.width() * 2 - NE_CONTEXT_HEADER_PAD,
        //     y: NE_CONTEXT_HEADER_PAD
        // });

        // ContextMenu.add(elementList);

        // var element1 = new Konva.Text({
        //     y: NE_CONTEXT_ELEMNT_PAD,
        //     text: 'Output',
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
        //#endregion
        this.stage.add(this.nodeLayer);
        VSCShell.eventSyncHandler = (msg) => {
            if (msg.data != null)
                try {
                    this.setState(JSON.parse(msg.data, (key, val) => {
                        switch (key) {
                            case 'inputs':
                            case 'outputs':
                            case 'schema':
                            case 'bgSizes':
                            case 'bgPos':
                            case 'nodes':
                                if (typeof val == "object") {
                                    console.log(val);
                                    return val;
                                }
                                else throw ("Document parsing error object-" + typeof val);
                            case 'x':
                            case 'y':
                            case 'type':
                            case 'execution':
                            case 'nodeCount':
                            case 'dataCount':
                                if (typeof val == "number")
                                    return val;
                                else throw ("Document parsing error number-" + typeof val);
                            case 'reference':
                            case 'target':
                            case 'name':
                                if (typeof val == "string") {
                                    return val;
                                } else throw ("Document parsing error string-" + typeof val);
                            case 'undefined':
                            case 'NaN':
                                // strip restricted keys
                                // not returning from reviver
                                // drops value and key
                                break;
                            default:
                                if (typeof parseInt(key) != "number") {
                                    console.warn("Unidentified symbol:" + key);
                                }
                                return val;
                        }
                    }));
                } catch (error) {
                    console.error(error);
                }
            else console.log("Initializing new document...");
        };
    }

    public setState(jsonState: EditorState) {
        this.state = jsonState;
        this.nodeLayer.destroyChildren();
        for (const id in this.state.nodes) {
            this.createNode(this.state.nodes[id], parseInt(id));
        }
        this.stage.batchDraw();
    }
    public getState() {
        return JSON.stringify(this.state);
    }

    public editNodeState(nodeGroup: Konva.Group) {
        var signature = this.state.nodes[nodeGroup.id().split("-")[1]];

        signature.x = nodeGroup.x();
        signature.y = nodeGroup.y();

        this.state.nodes[nodeGroup.id().split("-")[1]] = signature;
        VSCShell.syncData(NE_STAGE.getState());
    }

    public newNode(signature: NodeSignature) {
        this.createNode(signature, Object.keys(this.state.nodes).length);
        VSCShell.syncData(NE_STAGE.getState());
    }

    private createNode(signature: NodeSignature, id: number) {
        this.state.nodes[id] = signature;
        var node = new Konva.Group({
            id: "node-" + id,
            x: signature.x,
            y: signature.y,
            draggable: true,
        });

        node.on('mousedown', (e) => {
            var left = e.evt.button == 0;
            node.draggable(left);
        });
        node.on('dragend', (e) => {
            NE_STAGE.editNodeState(node);
        });

        var headGroup = new Konva.Group({

        });

        var methodText = new Konva.Text({
            y: NE_CONNECTOR_PAD_TOP,
            // text: signature.methodName,
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
                connectorCircle.on('mousedown', (e) => {

                });
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




}