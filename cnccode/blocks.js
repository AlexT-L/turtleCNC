SymbolMorph.prototype.names.push('largeStage');
SymbolMorph.prototype.names.push('zoomToFit');

SymbolMorph.prototype.originalSymbolCanvasColored = SymbolMorph.prototype.symbolCanvasColored;
SymbolMorph.prototype.symbolCanvasColored = function (aColor) {
    if (this.name == 'largeStage') {
        return this.drawSymbolLargeStage(newCanvas(new Point(this.symbolWidth(), this.size)), aColor);
    } else if (this.name == 'zoomToFit') {
		    return this.drawSymbolZoomToFit(newCanvas(new Point(this.symbolWidth(), this.size)), aColor);
	  } else if (this.name == 'turtle') {
      return this.drawSymbolTurtle(newCanvas(new Point(this.symbolWidth(), this.size)), aColor);
    } else {
        return this.originalSymbolCanvasColored(aColor)
    }
}

SymbolMorph.prototype.drawSymbolFullScreen = function (canvas, color) {
    // answer a canvas showing two arrows pointing diagonally outwards
    var ctx = canvas.getContext('2d'),
        h = canvas.height,
        c = canvas.width / 2,
        off = canvas.width / 10,
        w = canvas.width / 2;

    ctx.strokeStyle = color.toString();
    ctx.lineWidth = 1.5;
    ctx.moveTo(c - off, c + off);
    ctx.lineTo(0, h);
    ctx.stroke();

    ctx.moveTo(c + off, c - off);
    ctx.lineTo(h, 0);
    ctx.stroke();

    ctx.moveTo(0, h);
    ctx.lineTo(0, h - w);
    ctx.stroke();
    ctx.moveTo(0, h);
    ctx.lineTo(w, h);
    ctx.stroke();

    ctx.moveTo(h, 0);
    ctx.lineTo(h - w, 0);
    ctx.stroke();
    ctx.moveTo(h, 0);
    ctx.lineTo(h, w);
    ctx.stroke();

    return canvas;
};

SymbolMorph.prototype.drawSymbolZoomToFit = function (canvas, color) {
    // answer a canvas showing two arrows pointing diagonally outwards
    var ctx = canvas.getContext('2d'),
        h = canvas.height,
        c = canvas.width / 2,
        off = canvas.width / 10,
        w = canvas.width / 4;

    ctx.strokeStyle = color.toString();
    ctx.lineWidth = 1.5;


    ctx.moveTo(0, 0);
    ctx.lineTo(w, 0);
    ctx.stroke();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, w);
    ctx.stroke();

    ctx.moveTo(0, h);
    ctx.lineTo(0, h - w);
    ctx.stroke();
    ctx.moveTo(0, h);
    ctx.lineTo(w, h);
    ctx.stroke();

    ctx.moveTo(h, 0);
    ctx.lineTo(h - w, 0);
    ctx.stroke();
    ctx.moveTo(h, 0);
    ctx.lineTo(h, w);
    ctx.stroke();

    ctx.moveTo(h, h);
    ctx.lineTo(h - w, h);
    ctx.stroke();
    ctx.moveTo(h, h);
    ctx.lineTo(h, h - w);
    ctx.stroke();

    return canvas;
};



SymbolMorph.prototype.drawSymbolFile= function (canvas, color) {
    // answer a canvas showing a page symbol
    var ctx = canvas.getContext('2d'),
        w = Math.min(canvas.width, canvas.height) / 2;

    //ctx.fillStyle = color.toString();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w, 0);
    ctx.lineTo(w, w);
    ctx.lineTo(canvas.width, w);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.stroke();
    //ctx.fill();

    //ctx.fillStyle = color.darker(25).toString();
    ctx.beginPath();
    ctx.moveTo(w, 0);
    ctx.lineTo(canvas.width, w);
    ctx.lineTo(w, w);
    ctx.lineTo(w, 0);
    ctx.stroke();
    //ctx.fill();

    return canvas;
};

SymbolMorph.prototype.drawSymbolNormalScreen = function (canvas, color) {
    // answer a canvas showing two arrows pointing diagonally outwards
    var ctx = canvas.getContext('2d'),
        h = canvas.height,
        c = canvas.width / 2,
        off = canvas.width / 10,
        w = canvas.width / 2;

    ctx.strokeStyle = color.toString();
    ctx.lineWidth = 1.5;
    ctx.moveTo(c - off, c + off);
    ctx.lineTo(0, h);
    ctx.stroke();

    ctx.moveTo(c + off, c - off);
    ctx.lineTo(h, 0);
    ctx.stroke();

    ctx.moveTo(0, h);
    ctx.lineTo(0, h - w);
    ctx.stroke();
    ctx.moveTo(0, h);
    ctx.lineTo(w, h);
    ctx.stroke();

    ctx.moveTo(h, 0);
    ctx.lineTo(h - w, 0);
    ctx.stroke();
    ctx.moveTo(h, 0);
    ctx.lineTo(h, w);
    ctx.stroke();

    return canvas;
};


SymbolMorph.prototype.drawSymbolLargeStage = function (canvas, color) {
    var ctx = canvas.getContext('2d'),
        w = canvas.width,
        h = canvas.height,
        w2 = w * 1 / 3,
        h2 = h * 2 / 3;

    ctx.strokeStyle = color.toString();
    ctx.lineWidth = 2;
    ctx.rect(0, 0, w, h);
    ctx.stroke();
    ctx.rect(w2, 0, w, h2);
    ctx.stroke();

    return canvas;
};

SymbolMorph.prototype.drawSymbolNormalStage = function (canvas, color) {
    var ctx = canvas.getContext('2d'),
        w = canvas.width,
        h = canvas.height,
        w2 = w / 2,
        h2 = h / 2;

    ctx.strokeStyle = color.toString();
    ctx.lineWidth = 2;
    ctx.rect(0, 0, w, h);
    ctx.stroke();
    ctx.rect(w2, 0, w2, h2);
    ctx.stroke();

    return canvas;
};

SymbolMorph.prototype.drawSymbolSmallStage = function (canvas, color) {
    var ctx = canvas.getContext('2d'),
        w = canvas.width,
        h = canvas.height,
        w2 = w * 2 / 3,
        h2 = h * 1 / 3;

    ctx.strokeStyle = color.toString();
    ctx.lineWidth = 2;
    ctx.rect(0, 0, w, h);
    ctx.stroke();
    ctx.rect(w2, 0, w2, h2);
    ctx.stroke();

    return canvas;
};

SymbolMorph.prototype.originalSymbolWidth = SymbolMorph.prototype.symbolWidth;
SymbolMorph.prototype.symbolWidth = function () {
    switch (this.name) {
    case 'gears':
    case 'file':
        return this.originalSymbolWidth() * 2;
    default:
        return this.originalSymbolWidth();
    }
};

SymbolMorph.prototype.drawSymbolGears = function (canvas, color) {
    // overriden to add a small triangle to its right
    var ctx = canvas.getContext('2d'),
        w = canvas.width / 2,
        r = w / 2,
        e = w / 6,
        triangleX = w * 7/6;

    ctx.strokeStyle = color.toString();
    ctx.fillStyle = color.toString();
    ctx.lineWidth = canvas.height / 7;

    ctx.beginPath();
    ctx.arc(r, r, e * 1.5, radians(0), radians(360));
    ctx.fill();


    ctx.moveTo(0, r);
    ctx.lineTo(w, r);
    ctx.stroke();

    ctx.moveTo(r, 0);
    ctx.lineTo(r, w);
    ctx.stroke();

    ctx.moveTo(e, e);
    ctx.lineTo(w - e, w - e);
    ctx.stroke();

    ctx.moveTo(w - e, e);
    ctx.lineTo(e, w - e);
    ctx.stroke();

    ctx.globalCompositeOperation = 'destination-out';

    ctx.beginPath();
    ctx.arc(r, r, e * 1.5, radians(0), radians(360), true);
    ctx.fill();

    ctx.globalCompositeOperation = 'source-over';

    // triangle
    ctx.beginPath();
    ctx.moveTo(triangleX + 1, canvas.height / 5 * 2);
    ctx.lineTo(triangleX + 1 + (canvas.width - triangleX - 2) / 2, canvas.height / 5 * 4);
    ctx.lineTo(canvas.width - 1, canvas.height / 5 * 2);
    ctx.lineTo(triangleX + 1, canvas.height / 5 * 2);
    ctx.closePath();
    ctx.fill();

    return canvas;
};

SymbolMorph.prototype.drawSymbolTurtle = function (canvas, color) {
    var ctx = canvas.getContext('2d'),
        w = canvas.width / 2,
        r = w / 2,
        e = w / 6,
        triangleX = w * 7/6;

    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, w, w);
    this.drawTexture('cnccode/assets/turtles16.png');

    ctx.globalCompositeOperation = 'destination-out';

    ctx.beginPath();
    ctx.arc(r, r, e * 1.5, radians(0), radians(360), true);
    ctx.fill();

    ctx.globalCompositeOperation = 'source-over';

    // triangle
    ctx.beginPath();
    ctx.moveTo(triangleX + 1, canvas.height / 5 * 2);
    ctx.lineTo(triangleX + 1 + (canvas.width - triangleX - 2) / 2, canvas.height / 5 * 4);
    ctx.lineTo(canvas.width - 1, canvas.height / 5 * 2);
    ctx.lineTo(triangleX + 1, canvas.height / 5 * 2);
    ctx.closePath();
    ctx.fill();

    return canvas;
};



SymbolMorph.prototype.drawSymbolFile = function (canvas, color) {
    // overriden to add a small triangle to its right
    var ctx = canvas.getContext('2d'),
        w = canvas.width / 4,
        maxW = canvas.width / 2;

    ctx.fillStyle = color.toString();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w, 0);
    ctx.lineTo(w, w);
    ctx.lineTo(maxW, w);
    ctx.lineTo(maxW, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = color.darker(25).toString();
    ctx.beginPath();
    ctx.moveTo(w, 0);
    ctx.lineTo(maxW, w);
    ctx.lineTo(w, w);
    ctx.lineTo(w, 0);
    ctx.closePath();
    ctx.fill();

    // triangle
    ctx.beginPath();
    ctx.moveTo(maxW + 2, canvas.height / 5 * 2);
    ctx.lineTo(maxW + 2 + (canvas.width - maxW - 2) / 2, canvas.height / 5 * 4);
    ctx.lineTo(canvas.width, canvas.height / 5 * 2);
    ctx.lineTo(maxW + 2, canvas.height / 5 * 2);
    ctx.closePath();
    ctx.fill();

    return canvas;
};


// Hue slot morph

var HueSlotMorph;

HueSlotMorph.prototype = new ColorSlotMorph();
HueSlotMorph.prototype.constructor = HueSlotMorph;
HueSlotMorph.uber = ColorSlotMorph.prototype;

function HueSlotMorph(clr) {
    this.init(clr);
}

HueSlotMorph.prototype.init = function (clr) {
    HueSlotMorph.uber.init.call(this, null, true); // silently
    this.setColor(clr || new Color(127.5, 0, 0));
};

HueSlotMorph.prototype.getUserColor = function () {
    var myself = this,
        world = this.world(),
        hand = world.hand,
        posInDocument = getDocumentPositionOf(world.worldCanvas),
        mouseMoveBak = hand.processMouseMove,
        mouseDownBak = hand.processMouseDown,
        mouseUpBak = hand.processMouseUp,
        pal = new HueWheelMorph(null, new Point(
            this.fontSize * 12,
            this.fontSize * 12
        ));
    world.add(pal);
    pal.setPosition(this.bottomLeft().add(new Point(0, this.edge)));
    pal.addShadow(new Point(2, 2), 80);

    hand.processMouseMove = function (event) {
        hand.setPosition(new Point(
            event.pageX - posInDocument.x,
            event.pageY - posInDocument.y
        ));
        myself.setColor(world.getGlobalPixelColor(hand.position()));
    };

    hand.processMouseDown = nop;

    hand.processMouseUp = function () {
        pal.destroy();
        hand.processMouseMove = mouseMoveBak;
        hand.processMouseDown = mouseDownBak;
        hand.processMouseUp = mouseUpBak;
    };
};

// CNC addition
InputSlotMorph.prototype.materialsMenu = function () {
    var dict = {},
        rcvr = this.parentThatIsA(BlockMorph).scriptTarget(),
        stage = rcvr.parentThatIsA(StageMorph);
        
    var materials = {
        'aluminium':'Aluminium',
        'acrylic':'Acrylic',
        'solid':'Solid Surface',
        'softplastic':'Soft Plastic',
        'hardplastic':'Hard Plastic',
        'phenolic':'Phenolic',
        'laminate':'High Pressure Laminate',
        'mdf':'MDF / Particle Board',
        'softwood':'Softwood & Plywood',
        'hardwood':'Hardwood'
        };

    materials.forEach(function (name) {
        dict[materials[name]] = [name];}
    );
    return dict;
};

// labelPart() proxy
SyntaxElementMorph.prototype.originalLabelPart = SyntaxElementMorph.prototype.labelPart;
SyntaxElementMorph.prototype.labelPart = function (spec) {
    var part;
    switch (spec) {
        case '%hsb':
            part = new InputSlotMorph(
                null,
                false,
                {
                    'hue' : ['hue'],
                    'saturation' : ['saturation'],
                    'brightness' : ['brightness'],
                },
                true
                );
            break;
        case '%huewheel':
            part = new HueSlotMorph();
            part.isStatic = true;
			         break;

        // New CNC Additions
        case '%material':
            part = new InputSlotMorph(
                null,
                false,
                /*{
                    'Aluminium' : ['aluminium'],
                    'Acrylic' : ['acrylic'],
                    'Solid Surface' : ['solid'],
                    'Soft Plastic' : ['softplastic'],
                    'Hard Plastic': ['hardplastic'],
                    'Phenolic' : ['phenolic'],
                    'High Pressure Laminate' : ['laminate'],
                    'MDF / Particle Board' : ['mdf'],
                    'Softwood & Plywood' : ['softwood'],
                    'Hardwood' : ['hardwood']
                },*/
                TurtleShepherd.prototype.materialDisplayNames,
                true
            );
            break;
        case '%machine':
            part = new InputSlotMorph(
                null,
                false,
                TurtleShepherd.prototype.machines.displayNames,
                //{'Test':['Test']},
                true
            );
            break;
        case '%units':
            part = new InputSlotMorph(
                null,
                false,
                {
                    [''] : false,
                    'in' : 'in',
                    'mm' : 'mm'
                },
                true
            );
            break;
        default:
            part = this.originalLabelPart(spec);
            break;
    }
    return part;
};
