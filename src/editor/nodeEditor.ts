/* eslint-disable curly */
/* eslint-disable eqeqeq */
import Konva from 'Konva';

// @ts-ignore
const vscode = acquireVsCodeApi();

/*
There is absolutely no reason to stick to adaptive design or whatnot
this is because everything is scalable with mousewheel
the only priority design-wise is 'good looks'
*/

const PANEL_WIDTH = 150;
const CONTEXT_HEADER_PAD = 20;
const CONTEXT_ELEMNT_PAD = 20;
const METHOD_TXT_PAD_LEFT = 15;
const CONNECTOR_PAD_HORIZONTAL = 10;
const METHOD_TXT_PAD_BOT = 10;
const METHOD_TXT_FONT_SIZE = 16;
const CONNECTOR_TXT_FONT_SIZE = 13;
const CONNECTOR_TXT_WIDTH = PANEL_WIDTH / 3;
const CONNECTOR_RADIUS = 4.5;
const CONNECTOR_PAD_TOP = 8;
const BODY_PANEL_COLOR = '#ffffff';
const METHOD_PANEL_OPACITY = 1;//0.6;
const BODY_PANEL_OPACITY = 1;//0.4;
const FONT_FAMILY = 'Arial';

var width = window.innerWidth;
var height = window.innerHeight;
var stageLeftButton: boolean;
var stageBackgroundSizes: number[] = [100, 20];
// var 


var stage = new Konva.Stage({
    container: 'editor-main',
    width: width,
    height: height,
    draggable: true,
});

var stageContextMenu = new Konva.Group({
    width: PANEL_WIDTH,
    height: PANEL_WIDTH * 2,
    visible: false
});

var elementList = new Konva.Group({
    width: stageContextMenu.width(),
    height: stageContextMenu.width() * 2 - CONTEXT_HEADER_PAD,
    y: CONTEXT_HEADER_PAD
});

stageContextMenu.add(elementList);

var element1 = new Konva.Text({
    y: CONTEXT_ELEMNT_PAD,
    text: 'Output',
    fontSize: METHOD_TXT_FONT_SIZE,
    fontFamily: 'Calibri',
    align: 'left',
    // x: METHOD_TXT_PAD_LEFT / 2,
    ellipsis: true,
    width: PANEL_WIDTH,
    height: CONTEXT_HEADER_PAD,
    wrap: 'none'

});

elementList.add(element1);




stage.container().style.backgroundImage = "linear-gradient(rgba(255,255,255,0.2) 1.3px, transparent 2px),linear-gradient(90deg, rgba(255,255,255,0.2) 1.3px, transparent 1px),linear-gradient(rgba(255,255,255,0.1) 0.8px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,.1) 0.8px, transparent 1px)";
stage.container().style.backgroundSize = `${stageBackgroundSizes[0]}px ${stageBackgroundSizes[0]}px, ${stageBackgroundSizes[0]}px ${stageBackgroundSizes[0]}px, ${stageBackgroundSizes[1]}px ${stageBackgroundSizes[1]}px, ${stageBackgroundSizes[1]}px ${stageBackgroundSizes[1]}px`;

Konva.angleDeg = false;
Konva.dragButtons = [0, 2];

var layer = new Konva.Layer({
    existingNodesCount: 0,
});
stage.add(layer);

class MethodSignature {
    methodName!: string;
    ins?: InSignature[];
    outs?: OutSignature[];
}
class InSignature {
    name!: string;

}
class OutSignature {
    name!: string;

}

function createNode(x: number, y: number, signature: MethodSignature) {
    var nodeid = "node-" + layer.getAttr("existingNodesCount");
    var nodeFullId = nodeid + "-nt-0-af-0-rf-0";
    layer.setAttr("existingNodesCount", layer.getAttr("existingNodesCount") + 1);

    var node = new Konva.Group({
        id: nodeFullId,
        x: x,
        y: y,
        draggable: true,
        connectorInCount: 0,
        connectorOutCount: 0,
        signature: signature,

    });

    node.on('mousedown', (e) => {
        var left = e.evt.button === 0;
        node.draggable(left);
    });

    var headGroup = new Konva.Group({

    });

    var methodText = new Konva.Text({
        y: CONNECTOR_PAD_TOP,
        text: signature.methodName,
        fontSize: METHOD_TXT_FONT_SIZE,
        fontFamily: FONT_FAMILY,
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
        // cornerRadius: [6, 6, 0, 0],
        opacity: METHOD_PANEL_OPACITY,
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
    if (signature.ins != null && signature.ins.length > 0)
        bodyHeight = signature.ins.length * (CONNECTOR_RADIUS * 2 + CONNECTOR_PAD_TOP);
    if (signature.outs != null && signature.outs.length > 0) {
        var hee = signature.outs.length * (CONNECTOR_RADIUS * 2 + CONNECTOR_PAD_TOP);
        if (bodyHeight < hee) bodyHeight = hee;
    }
    var bodyPanel = new Konva.Rect({
        width: PANEL_WIDTH,
        height: bodyHeight,
        // cornerRadius: [0, 0, 6, 6],
        fill: BODY_PANEL_COLOR,
        opacity: BODY_PANEL_OPACITY,
        // shadowOffset: {x: 2, y: 2},
        // shadowOpacity: 0.4,
        // shadowBlur: 14,
    });
    bodyGroup.add(bodyPanel);

    //#region 
    // in connectors
    if (signature.ins != null) {
        var connectorCircle: Konva.Circle, yOffset = CONNECTOR_PAD_TOP, connectorText: Konva.Text;
        signature.ins.forEach(element => {
            var connectorGroup = new Konva.Group({
                id: nodeid + "-icid-" + node.getAttr("connectorInCount"),
                y: yOffset,
                x: CONNECTOR_PAD_HORIZONTAL,
            });
            node.setAttr("connectorInCount", node.getAttr("connectorInCount") + 1);
            connectorText = new Konva.Text({
                // y: -(CONNECTOR_RADIUS + CONNECTOR_PAD_TOP)/2,
                text: element.name,
                fontSize: CONNECTOR_TXT_FONT_SIZE,
                fontFamily: FONT_FAMILY,
                align: 'left',
                x: CONNECTOR_PAD_HORIZONTAL * 0.5 + CONNECTOR_RADIUS * 2,
                ellipsis: true,
                width: CONNECTOR_TXT_WIDTH,
                height: CONNECTOR_RADIUS * 1,
                wrap: 'none',
                offsetY: (CONNECTOR_RADIUS + CONNECTOR_PAD_TOP) / 2,
                fill: '#000000'
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
    // out connectors
    if (signature.outs != null) {
        var connectorCircle: Konva.Circle, yOffset = CONNECTOR_PAD_TOP, connectorText: Konva.Text;
        signature.outs.forEach(element => {
            var connectorGroup = new Konva.Group({
                id: nodeid + "-ocid-" + node.getAttr("connectorOutCount"),
                y: yOffset,
                x: PANEL_WIDTH - CONNECTOR_PAD_HORIZONTAL,
            });
            node.setAttr("connectorOutCount", node.getAttr("connectorOutCount") + 1);
            connectorText = new Konva.Text({
                // y: -(CONNECTOR_RADIUS + CONNECTOR_PAD_TOP)/2,
                text: element.name,
                fontSize: CONNECTOR_TXT_FONT_SIZE,
                fontFamily: FONT_FAMILY,
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

    node.add(headGroup);
    node.add(bodyGroup);
    var shad = new Konva.Rect({
        x: 0,
        y: 0,
        width: PANEL_WIDTH,
        height: methodNamePanel.height() + bodyPanel.height(),
        shadowBlur: 14,
        shadowOpacity: 0.35,
        opacity: 1,
        fill: '#fff'
    });
    node.add(shad);
    shad.zIndex(0);
    return node;
}

layer.add(createNode(50, 50, {
    methodName: "Main",
    ins: [],
}));
layer.add(createNode(200, 200, {
    methodName: "SystemOutput",
    ins: [
        { name: "out" }, { name: "test" }, { name: "number" },
        { name: "extra1" }, { name: "extra2" }, { name: "extra3" },
        { name: "extra1" }, { name: "extra2" }, { name: "extra3" },
        { name: "extra1" }, { name: "extra2" }, { name: "extra3" },
    ],
    outs: [
        { name: "return" }
    ],
}));


layer.draw();

var scaleBy = 1.03;

stage.on('wheel', (e) => {
    e.evt.preventDefault();
    var oldScale = stage.scaleX();
    // var oldBgScale = stageBackgroundSizes;

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

        // stageBackgroundSizes[0] = 100 * newScale;
        // stageBackgroundSizes[1] = 100 * newScale;

        // stage.container().style.backgroundSize = `${stageBackgroundSizes[0]}px ${stageBackgroundSizes[0]}px, ${stageBackgroundSizes[0]}px ${stageBackgroundSizes[0]}px, ${stageBackgroundSizes[1]}px ${stageBackgroundSizes[1]}px, ${stageBackgroundSizes[1]}px ${stageBackgroundSizes[1]}px`;
    }
    stage.batchDraw();
});
stage.on('contextmenu', (e) => {
    e.evt.preventDefault();
});
stage.on('mousedown', (e) => {
    stageLeftButton = e.evt.button === 0;
    stage.draggable(!stageLeftButton);
});
stage.on('dragmove', (e) => {
    stageContextMenu.hide();
    if (!stageLeftButton) {
        const pointerpos = stage.pointerPos;
        if (pointerpos !== null)
            stage.container().style.backgroundPosition = `${pointerpos.x}px ${pointerpos.y}px`;

    }
});

stage.on('click', (e) => {
    var isRight = e.evt.button === 2;
    if (isRight) {
        console.log("menu");
        stageContextMenu.visible(true);
        var point = stage.pointerPos;
        if (point != null)
            stageContextMenu.position(point);
    }
});