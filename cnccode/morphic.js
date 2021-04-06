Morph.fromImageURL = function(url) {
    var m = new Morph();

    m.texture = url;

    m.drawNew = function() {
        this.image = newCanvas(this.extent());
        var context = this.image.getContext('2d');
        context.fillStyle = 'rgba(0,0,0,0)';
        context.fillRect(0, 0, this.width(), this.height());
        if (this.texture) {
            this.drawTexture(this.texture);
        }
    }

    m.drawCachedTexture = function () {
        var context = this.image.getContext('2d');
        context.drawImage(
            this.cachedTexture,
            0,
            Math.round((this.height() - this.cachedTexture.height) / 2)
        );
        this.changed();
    };

    m.drawNew();

    m.setExtent(new Point(m.cachedTexture.width, m.cachedTexture.height));

    return m;
}

// ColorPaletteMorph ///////////////////////////////////////////////////

// from https://github.com/jguille2

var ColorPaletteMorph;

// ColorPaletteMorph inherits from Morph:

ColorPaletteMorph.prototype = new Morph();
ColorPaletteMorph.prototype.constructor = ColorPaletteMorph;
ColorPaletteMorph.uber = Morph.prototype;

// ColorPaletteMorph instance creation:

function ColorPaletteMorph(target, sizePoint) {
    this.init(
        target || null,
        sizePoint || new Point(80, 50)
    );
}

ColorPaletteMorph.prototype.init = function (target, size) {
    ColorPaletteMorph.uber.init.call(this);
    this.target = target;
    this.targetSetter = 'color';
    this.silentSetExtent(size);
    this.choice = null;
    this.drawNew();
};

ColorPaletteMorph.prototype.drawNew = function () {
    var context, ext, x, y, h, l, colors;

    ext = this.extent();
    this.image = newCanvas(this.extent());
    context = this.image.getContext('2d');
    this.choice = new Color();
    colors = ['rgb(0, 0,0)',    //black
        'rgb(128, 128, 128)',   //gray
        'rgb(192, 192, 192)',   //silver
        'rgb(255, 255, 255)',   //white
        'rgb(139, 69, 19)',     //saddlebrown
        'rgb(128, 0, 0)',       //maroon
        'rgb(255, 0, 0)',       //red
        'rgb(255, 192, 203)',   //pink
        'rgb(255, 165, 0)',     //orange
        'rgb(210, 105, 30)',    //chocolate
        'rgb(255, 255, 0)',     //yellow
        'rgb(128, 128, 0)',     //olive
        'rgb(0, 255, 0)',       //lime
        'rgb(0, 128, 0)',       //green
        'rgb(0, 255, 255)',     //aqua
        'rgb(0, 128, 128)',     //teal
        'rgb(0, 0, 255)',       //blue
        'rgb(0, 0, 128)',       //navy
        'rgb(128, 0, 128)',     //purple
        'rgb(255, 0, 255)'      //magenta
    ];
    // HSL palette (with saturation = 100%)
    for (x = 0; x <= ext.x; x++) {
        h = 360 * x / ext.x;
        for (y = 0; y <= ext.y - 30; y++) {
            l = 100 - (y / (ext.y - 30) * 100);
            context.fillStyle = 'hsl(' + h + ',100%,' + l + '%)';
            context.fillRect(x, y, 1, 1);
        }
    }
    // Gray scale
    for (x = 0; x <= ext.x; x++) {
        l = 100 - (x/ ext.x * 100);
        context.fillStyle = 'hsl(0, 0%, ' + l + '%)';
        context.fillRect(x, ext.y - 30, 1, 10);
    }
    // 20 colors palette (two rows)
    for (x = 0; x < 20; x++) {
        context.fillStyle = colors[x];
        if (x % 2 == 0) {
            context.fillRect((x / 2) * ext.x / 10, ext.y - 20, ext.x / 10, 10);
        } else {
            context.fillRect((Math.round(x / 2) - 1) * ext.x / 10, ext.y - 10, ext.x / 10, 10);
        }
    }
};

ColorPaletteMorph.prototype.mouseMove = function (pos) {
    this.choice = this.getPixelColor(pos);
    this.updateTarget();
};

ColorPaletteMorph.prototype.mouseDownLeft = function (pos) {
    this.choice = this.getPixelColor(pos);
    this.updateTarget();
};

ColorPaletteMorph.prototype.updateTarget = function () {
    if (this.target instanceof Morph && this.choice !== null) {
        if (this.target[this.targetSetter] instanceof Function) {
            this.target[this.targetSetter](this.choice);
        } else {
            this.target[this.targetSetter] = this.choice;
            this.target.drawNew();
            this.target.changed();
        }
    }
};

// ColorPaletteMorph menu:

ColorPaletteMorph.prototype.developersMenu = function () {
    var menu = ColorPaletteMorph.uber.developersMenu.call(this);
    menu.addLine();
    menu.addItem(
        'set target',
        "setTarget",
        'choose another morph\nwhose color property\n will be' +
            ' controlled by this one'
    );
    return menu;
};

ColorPaletteMorph.prototype.setTarget = function () {
    var choices = this.overlappedMorphs(),
        menu = new MenuMorph(this, 'choose target:'),
        myself = this;

    choices.push(this.world());
    choices.forEach(function (each) {
        menu.addItem(each.toString().slice(0, 50), function () {
            myself.target = each;
            myself.setTargetSetter();
        });
    });
    if (choices.length === 1) {
        this.target = choices[0];
        this.setTargetSetter();
    } else if (choices.length > 0) {
        menu.popUpAtHand(this.world());
    }
};

ColorPaletteMorph.prototype.setTargetSetter = function () {
    var choices = this.target.colorSetters(),
        menu = new MenuMorph(this, 'choose target property:'),
        myself = this;

    choices.forEach(function (each) {
        menu.addItem(each, function () {
            myself.targetSetter = each;
        });
    });
    if (choices.length === 1) {
        this.targetSetter = choices[0];
    } else if (choices.length > 0) {
        menu.popUpAtHand(this.world());
    }
};


// Hue Wheel
// 
// from Bernat / BeetleBlocks

var HueWheelMorph;

// ColorPaletteMorph inherits from Morph:

HueWheelMorph.prototype = new ColorPaletteMorph();
HueWheelMorph.prototype.constructor = HueWheelMorph;
HueWheelMorph.uber = ColorPaletteMorph.prototype;

// ColorPaletteMorph instance creation:

function HueWheelMorph(target, sizePoint) {
    this.init(
        target || null,
        sizePoint || new Point(80, 50)
    );
};

HueWheelMorph.prototype.drawNew = function () {
    var context, ext, x, y, radius;

    ext = this.extent();
    this.image = newCanvas(this.extent());
    context = this.image.getContext('2d');
    this.choice = new Color();
    x = this.image.width / 2 + 2;
    y = this.image.height / 2;
    radius = this.image.width / 2 - 22;

    context.font = '9px Arial';
    context.fillStyle = 'rgb(200,200,200)';
    context.fillRect(0, 0, this.image.width, this.image.height);
    context.strokeRect(0, 0, this.image.width, this.image.height);

    context.textAlign = 'center';
    context.textBaseline = 'middle';

    for (var angle = 360; angle > 0; angle --) {
        var startAngle = (angle - 1) * Math.PI/180;
        var endAngle = (angle + 1) * Math.PI/180;
        context.beginPath();
        context.moveTo(x, y);
        context.arc(x, y, radius, startAngle, endAngle, false);
        context.closePath();
        context.fillStyle = 'hsl(' + angle + ', 100%, 50%)';
        context.fill();
        
        if (angle % 30 == 0) {
            var tx = x + (radius + 12) * Math.cos(radians(angle)),
                ty = y + (radius + 12) * Math.sin(radians(angle));

            context.fillStyle = 'rgb(10,10,10)';

            if (angle % 90 == 0) {
                context.fillText(angle % 360 + '°', tx, ty);
            } else {
                context.beginPath()
                context.moveTo(tx, ty);
                context.lineTo(tx + 5 * Math.cos(radians(angle)), ty + 5 * Math.sin(radians(angle)));
                context.stroke();
            }
        }
    }
};
