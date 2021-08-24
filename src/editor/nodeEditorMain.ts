import Konva from 'konva';
import { NE_PANEL_WIDTH, NE_CONTEXT_HEADER_PAD, NE_CONTEXT_ELEMNT_PAD, NE_METHOD_TXT_FONT_SIZE, NE_SCALE_STRENGTH, NE_STAGE, NE_FONT_FAMILY } from './nodeEditorConst';
import { DragState } from './nodeEditorHostDef';
import { VSCShell } from './vscShell';

// main entry point

/*
There is absolutely no reason to stick to adaptive design or whatnot
this is because everything is scalable with mousewheel
the only priority design-wise is 'good looks'
*/


var stageLeftButton: boolean;

NE_STAGE.stage.width(window.innerWidth);
NE_STAGE.stage.height(window.innerHeight);


NE_STAGE.stage.container().style.backgroundImage = "linear-gradient(rgba(255,255,255,0.2) 1.3px, transparent 2px),linear-gradient(90deg, rgba(255,255,255,0.2) 1.3px, transparent 1px),linear-gradient(rgba(255,255,255,0.1) 0.8px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,.1) 0.8px, transparent 1px)";

NE_STAGE.stage.container().style.backgroundSize = `${NE_STAGE.state.schema.bgSizes[0]}px ${NE_STAGE.state.schema.bgSizes[0]}px, ${NE_STAGE.state.schema.bgSizes[0]}px ${NE_STAGE.state.schema.bgSizes[0]}px, ${NE_STAGE.state.schema.bgSizes[1]}px ${NE_STAGE.state.schema.bgSizes[1]}px, ${NE_STAGE.state.schema.bgSizes[1]}px ${NE_STAGE.state.schema.bgSizes[1]}px`;

NE_STAGE.stage.container().style.backgroundPosition = `0px 0px`;

Konva.angleDeg = false;
Konva.dragButtons = [0, 2];


NE_STAGE.stage.draw();

NE_STAGE.stage.on('wheel', (e) => {
    e.evt.preventDefault();
    var oldScale = NE_STAGE.stage.scaleX();
    var oldScaleBG: [number, number] = NE_STAGE.state.schema.bgSizes;

    var pointer = NE_STAGE.stage.getPointerPosition();
    if (pointer != null) {
        var mousePointTo = {
            x: (pointer.x - NE_STAGE.stage.x()) / oldScale,
            y: (pointer.y - NE_STAGE.stage.y()) / oldScale,
        };

        var newScale;
        var newScaleBG: [number, number];
        if (e.evt.deltaY > 0) {
            newScale = oldScale / NE_SCALE_STRENGTH;
            newScaleBG = [oldScaleBG[0] / NE_SCALE_STRENGTH, oldScaleBG[1] / NE_SCALE_STRENGTH];
        } else {
            newScale = oldScale * NE_SCALE_STRENGTH;
            newScaleBG = [oldScaleBG[0] * NE_SCALE_STRENGTH, oldScaleBG[1] * NE_SCALE_STRENGTH];
        }

        NE_STAGE.stage.scale({ x: newScale, y: newScale });
        // NE_STAGE.container().style.backgroundSize = `${newScaleBG[0]}px ${newScaleBG[0]}px, ${NE_STAGE.state.schema.bgSizes[0]}px ${NE_STAGE.state.schema.bgSizes[0]}px, ${NE_STAGE.state.schema.bgSizes[1]}px ${NE_STAGE.state.schema.bgSizes[1]}px, ${newScaleBG[1]}px ${newScaleBG[1]}px`;

        var newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };
        NE_STAGE.stage.position(newPos);

    }
    NE_STAGE.stage.batchDraw();
});
// Safer & easier to implement custom contexmenu
NE_STAGE.stage.on('contextmenu', (e) => {
    e.evt.preventDefault();
});
NE_STAGE.stage.on('mousedown', (e) => {
    stageLeftButton = e.evt.button == 0;
    NE_STAGE.stage.draggable(!stageLeftButton);
});
NE_STAGE.stage.on('mouseup', (e) =>{
    switch(NE_STAGE.dragState){
        case DragState.CONNECT:
            
        default:
    }
    NE_STAGE.dragState = DragState.NONE;
});
NE_STAGE.stage.on('dragmove', (e) => {
    if (!stageLeftButton) {
        const pointerpos = NE_STAGE.stage.pointerPos;
        if (pointerpos != null) {
            // NE_STAGE.state.schema.bgPos = [pointerpos.x, pointerpos.y];
            NE_STAGE.stage.container().style.backgroundPosition = `${pointerpos.x}px ${pointerpos.y}px`;
        }

    }
});

NE_STAGE.stage.on('click', (e) => {
    var isRight = e.evt.button == 2;

    if (isRight) {
        var pos = { x: 0, y: 0 };
        pos = NE_STAGE.stage.getPointerPosition()!;
        pos.x -= NE_STAGE.stage.position().x;
        pos.y -= NE_STAGE.stage.position().y;
        NE_STAGE.newNode({
            type: 0,
            x: pos?.x,
            y: pos?.y,
        });
    }
});

window.onresize = () => {
NE_STAGE.stage.width(window.innerWidth);
NE_STAGE.stage.height(window.innerHeight);
}

// var filename = new Konva.Text({
//     fontSize: NE_METHOD_TXT_FONT_SIZE,
//     fontFamily: NE_FONT_FAMILY,
//     align: 'left',
//     ellipsis: true,
//     wrap: 'none',
//     draggable: false
// });

// Client finished setting up
VSCShell.sendReady()