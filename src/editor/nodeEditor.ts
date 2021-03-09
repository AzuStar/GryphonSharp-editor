/* eslint-disable curly */
/* eslint-disable eqeqeq */
import Konva from 'Konva';

// @ts-ignore
const vscode = acquireVsCodeApi();

const PANEL_WIDTH = 150;
const METHOD_TXT_PAD_LEFT = 15;
const CONNECTOR_PAD_HORIZONTAL = 10;
const METHOD_TXT_PAD_BOT = 10;
const METHOD_TXT_FONT_SIZE = 16;
const CONNECTOR_TXT_FONT_SIZE = 13;
const CONNECTOR_TXT_WIDTH = PANEL_WIDTH / 3;
const CONNECTOR_RADIUS = 4.5;
const CONNECTOR_PAD_TOP = 8;
const BODY_PANEL_COLOR = '#000000';
const METHOD_PANEL_OPACITY = 0.6;
const BODY_PANEL_OPACITY = 0.4;

var width = window.innerWidth;
var height = window.innerHeight;
var stageLeftButton: boolean;
// var 


var stage = new Konva.Stage({
    container: 'editor-main',
    width: width,
    height: height,
    draggable: true,
});


stage.container().style.backgroundImage = "linear-gradient(rgba(255,255,255,0.2) 1.3px, transparent 2px),linear-gradient(90deg, rgba(255,255,255,0.2) 1.3px, transparent 1px),linear-gradient(rgba(255,255,255,0.1) 0.8px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,.1) 0.8px, transparent 1px)";
stage.container().style.backgroundSize = "100px 100px, 100px 100px, 20px 20px, 20px 20px";
// stage.container().style.backgroundPosition = "-2px -2px, -2px -2px, -1px -1px, -1px -1px";

Konva.angleDeg = false;
Konva.dragButtons = [0, 2];

var layer = new Konva.Layer();
stage.add(layer);

class MethodSignature {
    methodName!: string;
    args?: ArgumentSignature[];
    returns?: ReturnSignature[];
}
class ArgumentSignature {
    name!: string;

}
class ReturnSignature {
    name!: string;

}

function createNode(x: number, y: number, signature: MethodSignature) {
    var node = new Konva.Group({
        x: x,
        y: y,
        draggable: true,
        signature: signature
    });

    node.on('mousedown', (e) => {
        var left = e.evt.button === 0;
        node.draggable(left);
    });

    var methodText = new Konva.Text({
        y: CONNECTOR_PAD_TOP,
        text: signature.methodName,
        fontSize: METHOD_TXT_FONT_SIZE,
        fontFamily: 'Calibri',
        align: 'left',
        x: METHOD_TXT_PAD_LEFT / 2,
        ellipsis: true,
        width: PANEL_WIDTH,
        height: METHOD_TXT_FONT_SIZE,
        wrap: 'none'
    });




    var methodNamePanel = new Konva.Rect({
        width: PANEL_WIDTH,
        height: methodText.height() + methodText.y() + METHOD_TXT_PAD_BOT,
        fill: BODY_PANEL_COLOR,
        cornerRadius: [6, 6, 0, 0],
        opacity: METHOD_PANEL_OPACITY,
    });

    var bodyGroup = new Konva.Group({
        y: methodNamePanel.height(),

    });
    var bodyHeight = 20;
    if (signature.args != null && signature.args.length > 0)
        bodyHeight = signature.args.length * (CONNECTOR_RADIUS * 2 + CONNECTOR_PAD_TOP);
    if (signature.returns != null && signature.returns.length > 0) {
        var hee = signature.returns.length * (CONNECTOR_RADIUS * 2 + CONNECTOR_PAD_TOP);
        if (bodyHeight < hee) bodyHeight = hee;
    }
    var bodyPanel = new Konva.Rect({
        width: PANEL_WIDTH,
        height: bodyHeight,
        cornerRadius: [0, 0, 6, 6],
        fill: BODY_PANEL_COLOR,
        opacity: BODY_PANEL_OPACITY,
    });
    //#region 
    // argument connectors
    if (signature.args != null) {
        var connectorCircle: Konva.Circle, yOffset = CONNECTOR_PAD_TOP, connectorText: Konva.Text;
        signature.args.forEach(element => {
            var connectorGroup = new Konva.Group({
                y: yOffset,
                x: CONNECTOR_PAD_HORIZONTAL,
            });
            connectorText = new Konva.Text({
                // y: -(CONNECTOR_RADIUS + CONNECTOR_PAD_TOP)/2,
                text: element.name,
                fontSize: CONNECTOR_TXT_FONT_SIZE,
                fontFamily: 'Calibri',
                align: 'left',
                x: CONNECTOR_PAD_HORIZONTAL * 0.5 + CONNECTOR_RADIUS * 2,
                ellipsis: true,
                width: CONNECTOR_TXT_WIDTH,
                height: CONNECTOR_RADIUS * 1,
                wrap: 'none',
                offsetY: (CONNECTOR_RADIUS + CONNECTOR_PAD_TOP) / 2
            });
            connectorCircle = new Konva.Circle({
                // x: CONNECTOR_PAD_LEFT,
                fill: '#cc0000',
                radius: CONNECTOR_RADIUS,
                stroke: '#000000',
                strokeWidth: 0.4,
            });
            yOffset += CONNECTOR_RADIUS * 2 + CONNECTOR_PAD_TOP;
            connectorCircle.on('mousedown', (e) => {

            });
            connectorGroup.add(connectorCircle);
            connectorGroup.add(connectorText);
            bodyGroup.add(connectorGroup);
        });
    }
    //#endregion

    //#region 
    // return connectors
    if (signature.returns != null) {
        var connectorCircle: Konva.Circle, yOffset = CONNECTOR_PAD_TOP, connectorText: Konva.Text;
        signature.returns.forEach(element => {
            var connectorGroup = new Konva.Group({
                y: yOffset,
                x: PANEL_WIDTH - CONNECTOR_PAD_HORIZONTAL,
            });
            connectorText = new Konva.Text({
                // y: -(CONNECTOR_RADIUS + CONNECTOR_PAD_TOP)/2,
                text: element.name,
                fontSize: CONNECTOR_TXT_FONT_SIZE,
                fontFamily: 'Calibri',
                align: 'right',
                x: - (CONNECTOR_PAD_HORIZONTAL * 0.5 + CONNECTOR_RADIUS * 2 + CONNECTOR_TXT_WIDTH),
                ellipsis: true,
                width: CONNECTOR_TXT_WIDTH,
                height: CONNECTOR_RADIUS * 1,
                wrap: 'none',
                offsetY: (CONNECTOR_RADIUS + CONNECTOR_PAD_TOP) / 2
            });
            connectorCircle = new Konva.Circle({
                // x: CONNECTOR_PAD_LEFT,
                fill: '#cc00aa',
                radius: CONNECTOR_RADIUS,
                stroke: '#000000',
                strokeWidth: 0.4,
            });
            yOffset += CONNECTOR_RADIUS * 2 + CONNECTOR_PAD_TOP;
            connectorGroup.add(connectorCircle);
            connectorGroup.add(connectorText);
            bodyGroup.add(connectorGroup);
        });
    }
    //#endregion

    // node.on();


    node.add(methodNamePanel);
    node.add(methodText);
    node.add(bodyGroup);
    bodyGroup.add(bodyPanel);


    return node;
}

layer.add(createNode(50, 50, {
    methodName: "Main",
    args: [],
}));
layer.add(createNode(200, 200, {
    methodName: "SystemOutput",
    args: [
        { name: "out" }, { name: "test" }, { name: "number" },
        { name: "extra1" }, { name: "extra2" }, { name: "extra3" },
        { name: "extra1" }, { name: "extra2" }, { name: "extra3" },
        { name: "extra1" }, { name: "extra2" }, { name: "extra3" },
    ],
    returns: [
        { name: "return" }
    ],
}));


layer.draw();

var scaleBy = 1.03;

stage.on('wheel', (e) => {
    e.evt.preventDefault();
    var oldScale = stage.scaleX();

    var pointer = stage.getPointerPosition();
    if (pointer !== null) {
        var mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        var newScale =
            e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

        stage.scale({ x: newScale, y: newScale });

        var newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };
        stage.position(newPos);
    }
    stage.batchDraw();
});
stage.on('contextmenu', (e) => {
    // console.log("menu");
});
stage.on('mousedown', (e) => {
    stageLeftButton = e.evt.button === 0;
    stage.draggable(!stageLeftButton);
});
stage.on('dragmove', (e) => {
    if (!stageLeftButton) {
        const pointerpos = stage.pointerPos;
        if (pointerpos !== null)
            stage.container().style.backgroundPosition = `${pointerpos.x}px ${pointerpos.y}px`;

    }
});

stage.on('click', (e) => {

});