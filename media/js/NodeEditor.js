import Konva from 'konva';

var width = window.innerWidth;
var height = window.innerHeight;

var stage = new Konva.Stage({
    container: 'editor-main',
    width: width,
    height: height,
    draggable: true,
});

Konva.angleDeg = false;

var layer = new Konva.Layer();
stage.add(layer);

var WIDTH = 3000;
var HEIGHT = 3000;

function GenerateNode(x, y) {
    return new Konva.Rect({
        x: x,
        y: y,
        width: 100,
        height: 100,
        fill: '#ff0000',
        cornerRadius: 5,
        draggable: true,
    });
}

layer.add(GenerateNode(10, 10));

layer.add(GenerateNode(350, 350));

layer.add(GenerateNode(1350, 1350));

layer.draw();

var scaleBy = 1.01;
stage.on('wheel', (e) => {
    e.evt.preventDefault();
    var oldScale = stage.scaleX();

    var pointer = stage.getPointerPosition();

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
    stage.batchDraw();
});