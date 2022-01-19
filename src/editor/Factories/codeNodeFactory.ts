import { CodeNodeType, NodeSignature } from "../Definitions/rawEditorState";
import { EditorStage } from "../nodeEditorHost";
import { NENode } from "../Definitions/editorNode";
import Konva from "konva";
import { NE_CONNECTOR_PAD_TOP, NE_METHOD_TXT_FONT_SIZE, NE_FONT_FAMILY, NE_METHOD_TXT_PAD_LEFT, NE_PANEL_WIDTH, NE_METHOD_TXT_PAD_BOT, NE_BODY_PANEL_COLOR, NE_METHOD_PANEL_OPACITY, NE_CONNECTOR_RADIUS, NE_BODY_PANEL_OPACITY, NE_CONNECTOR_PAD_HORIZONTAL, NE_CONNECTOR_TXT_FONT_SIZE, NE_CONNECTOR_TXT_WIDTH, NE_STAGE } from "../nodeEditorConst";
import { VSCShell } from "../vscShell";
import { DragState } from "../Definitions/editorHostAPI";

export abstract class ICodeNodeFactory {

    public abstract createNode(signature: NodeSignature, id: number, editor: EditorStage): NENode;

}

export class CodeNodeFactory extends ICodeNodeFactory {
    public createNode(signature: NodeSignature, nodeId: number, editor: EditorStage): NENode {

        var nodeMaster = new NENode(nodeId);

        var nodeGroup = new Konva.Group({
            id: nodeMaster.konvaId,
            x: signature.x,
            y: signature.y,
            draggable: true,
            opacity: 1,
        });
        editor.nodeLayer.add(nodeGroup);

        nodeGroup.on('mousedown', (e) => {
            var left = e.evt.button == 0;
            editor.dropFocusState();
            editor.dropDragState();
            // write connecting logicc
            // if (editor.overConnector) {
            //     editor.dragState = DragState.CONNECT;
            //     nodeGroup.draggable(false);
            //     editor.connectorDragLine = new Konva.Line({
            //         stroke: 'black',
            //     });
            //     editor.nodeLayer.add(editor.connectorDragLine);
            //     editor.connectorDragSource = editor.overConnector;
            // } else

            // if trying connectors dont make it draggable
            nodeGroup.draggable(left);
        });
        nodeGroup.on('mouseup', (e) => {
            if (editor.overConnector) {
                console.log(editor.connectorDragLine);

            }
            else {
            }
        });
        nodeGroup.on('dragend', (e) => {
            // DEBUG_FLAG
            // editor.updateNodeState(nodeGroup);
        });
        nodeGroup.on('dragstart', (e) => {
            nodeGroup.zIndex(3);
        });

        var bodyGroup = new Konva.Group({});
        var bodyHeight = NE_CONNECTOR_PAD_TOP * 2;

        var bodyPanel = new Konva.Rect({
            width: NE_PANEL_WIDTH,
            // cornerRadius: [0, 0, 6, 6],
            fill: NE_BODY_PANEL_COLOR,
            opacity: NE_BODY_PANEL_OPACITY,
        });
        bodyGroup.add(bodyPanel);
        nodeGroup.add(bodyGroup);

        switch (signature.type) {
            case CodeNodeType.branch:
            case CodeNodeType.invokeInstanceCall:
            case CodeNodeType.invokeOperatorCall:
            case CodeNodeType.loop:
            case CodeNodeType.executionEnter:
            case CodeNodeType.executionExit:
            case CodeNodeType.invokeStaticCall:
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
                var headPanel = new Konva.Rect({
                    width: NE_PANEL_WIDTH,
                    height: methodText.height() + methodText.y() + NE_METHOD_TXT_PAD_BOT,
                    fill: NE_BODY_PANEL_COLOR,
                    // cornerRadius: [6, 6, 0, 0],
                    opacity: NE_METHOD_PANEL_OPACITY,
                });

                headGroup.add(headPanel);
                headGroup.add(methodReferenceText);
                headGroup.add(methodText);
                headGroup.height(headPanel.height());
                nodeGroup.add(headGroup);
                if (signature.inputs != null)
                    bodyHeight = signature.inputs.length * (NE_CONNECTOR_RADIUS * 2 + NE_CONNECTOR_PAD_TOP);
                if (signature.outputs != null) {
                    var hee = signature.outputs.length * (NE_CONNECTOR_RADIUS * 2 + NE_CONNECTOR_PAD_TOP);
                    if (bodyHeight < hee) bodyHeight = hee;
                }
                bodyPanel.height(bodyHeight);

                var executionInConnector = new Konva.Line({
                    points: [
                        0, 0,
                        0.5, 0,
                        1, 0.5,
                        0.5, 1,
                        0, 1
                    ],
                    fill: "#000000",
                    closed: true,
                    scale: { x: NE_CONNECTOR_RADIUS * 2, y: NE_CONNECTOR_RADIUS * 2 },
                    x:NE_CONNECTOR_PAD_HORIZONTAL * 0.5 + NE_CONNECTOR_RADIUS * 2,
                    offsetY:0,
                });

                bodyGroup.add(executionInConnector);

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
                            editor.overConnector = connectorCircle;
                        });
                        connectorCircle.on('mouseout', (e) => {
                            editor.overConnector = undefined;
                        });

                        connectorGroup.add(connectorCircle);
                        connectorGroup.add(connectorText);
                        bodyGroup.add(connectorGroup);
                    });
                }
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
                        connectorCircle.on('mouseover', (e) => {
                            editor.overConnector = connectorCircle;
                        });
                        connectorCircle.on('mouseout', (e) => {
                            editor.overConnector = undefined;
                        });

                        connectorGroup.add(connectorCircle);
                        connectorGroup.add(connectorText);
                        bodyGroup.add(connectorGroup);
                    });
                }
                var shadow = new Konva.Rect({
                    x: 0,
                    y: 0,
                    width: NE_PANEL_WIDTH,
                    shadowBlur: 14,
                    shadowOpacity: 0.35,
                    opacity: 1,
                    fill: '#fff'
                });
                bodyGroup.y(headGroup.height());
                shadow.height(headPanel.height() + bodyPanel.height());
                nodeGroup.add(shadow);
                shadow.zIndex(0);
                break;
            case CodeNodeType.primitiveValue:
                bodyHeight = NE_CONNECTOR_PAD_TOP * 2 + NE_CONNECTOR_RADIUS * 2;
                bodyPanel.height(bodyHeight);
                var connectorGroup = new Konva.Group({
                    y: NE_CONNECTOR_PAD_TOP * 2,
                    x: NE_PANEL_WIDTH - NE_CONNECTOR_PAD_HORIZONTAL,
                });
                var data = editor.state.dataNodes[signature.dataReference!];
                var connectorValue!: Konva.Text;
                if (typeof data.value == 'string') {
                    connectorValue = new Konva.Text({
                        // y: -(NE_CONNECTOR_RADIUS + NE_CONNECTOR_PAD_TOP)/2,
                        text: data.value,
                        fontSize: NE_CONNECTOR_TXT_FONT_SIZE,
                        fontFamily: NE_FONT_FAMILY,
                        align: 'left',
                        x: -(NE_CONNECTOR_PAD_HORIZONTAL * 0.5 + NE_CONNECTOR_RADIUS * 2 + NE_CONNECTOR_TXT_WIDTH * 2),
                        ellipsis: true,
                        width: NE_CONNECTOR_TXT_WIDTH * 2,
                        height: NE_CONNECTOR_RADIUS * 1,
                        wrap: 'none',
                        y: 0,//(NE_CONNECTOR_RADIUS + NE_CONNECTOR_PAD_TOP) / 2,

                    });
                    connectorValue.on('dblclick dbltap', () => {
                        // create textarea over canvas with absolute position

                        // first we need to find position for textarea
                        // how to find it?

                        // at first lets find position of text node relative to the stage:
                        var textPosition = connectorValue.getAbsolutePosition();

                        var areaPosition = {
                            x: textPosition.x,
                            y: textPosition.y,
                        };

                        // create textarea and style it
                        var textarea = document.createElement('textarea');
                        document.body.appendChild(textarea);

                        textarea.value = connectorValue.text();
                        textarea.style.position = 'absolute';
                        textarea.style.top = (areaPosition.y - 2) + 'px';
                        textarea.style.left = (areaPosition.x - 2) + 'px';
                        textarea.style.width = connectorValue.width().toString();

                        textarea.focus();

                        textarea.addEventListener('keydown', function (e) {
                            // hide on enter
                            if (e.key === 'Enter' || e.key === 'Escape') {
                                connectorValue.text(textarea.value);

                                if (textarea.value != connectorValue.text()) {
                                    NE_STAGE.state.dataNodes[signature.dataReference!].value = textarea.value;
                                    VSCShell.syncData(NE_STAGE.getState());
                                }
                                document.body.removeChild(textarea);
                            }

                        });
                    });
                }
                connectorCircle = new Konva.Circle({
                    fill: '#cc00aa',
                    radius: NE_CONNECTOR_RADIUS,
                    stroke: '#000000',
                    strokeWidth: 0.4,
                });
                connectorGroup.add(connectorCircle);
                connectorGroup.add(connectorValue);
                bodyGroup.add(connectorGroup);
                var shadow = new Konva.Rect({
                    x: 0,
                    y: 0,
                    width: NE_PANEL_WIDTH,
                    shadowBlur: 14,
                    shadowOpacity: 0.35,
                    opacity: 1,
                    fill: '#fff'
                });
                bodyGroup.y(0);
                shadow.height(bodyPanel.height());
                nodeGroup.add(shadow);
                shadow.zIndex(0);
                break;
            default:
                throw new Error("Unknown signature type: " + signature.type);
                break;
        }


        return nodeMaster;
    }

}