/*
    TurtleShepherd
    ------------------------------------------------------------------
    turltestich's embroidery intelligence agency
    Embroidery function for Javscript
    ------------------------------------------------------------------
    Copyright (C) 2016-2017 Michael Aschauer

*/

// Create default libraries (units are in mm by default, converted to in if needed)

var materials = {},
    machines = {},
    mm2in = 1/25.4;

materials.displayNames = {
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
};

// Machines library
machines = {
    displayNames: {
        'Genmitsu PROVer 3018 w/ GRBRL': ['prover3018grbl']
    },
    'prover3018grbl' : {
        dimensions: {
            L : 250,
            W : 150,
            H : 35
        }
    }
};

TurtleShepherd.prototype = {};
TurtleShepherd.prototype.constructor = TurtleShepherd;
TurtleShepherd.uber = Object.prototype;

// Initialize default inputs for TurtleShepherd
TurtleShepherd.prototype.setDefaults = function() {
    this.materialDisplayNames = materials.displayNames;
    this.machines = machines;
    this.metric = true;
    this.in2mm = 1/25.4;
    //this.materialDisplayNames['Test'] = ['test'];
}
TurtleShepherd.prototype.setDefaults();

//TurtleShepherd.prototype.addMachine('TestMachine', 100, 50, 20);

function TurtleShepherd() {
    this.init();
}

TurtleShepherd.prototype.init = function() {
    this.clear();
    this.pixels_per_millimeter = 5;
	this.maxLength = 121;
    this.calcTooLong = true;
    this.densityMax = 15;
    this.ignoreColors = false;
    this.ignoreWarning = false;
    this.backgroundColor = {r:0,g:0,b:0,a:1};
    this.defaultColor = {r:0,g:0,b:0,a:1};

    // Drilling parameters
    this.speedup = 2; // Speed up time (s)

    // Material
    this.material;

    // Machine
    this.machine;
    
    // Bed dimensions
    this.bedLength; // X coordinate range
    this.bedWidth; // Y coordinate range
    this.bedHeight; // Z coordinate range
    
};

TurtleShepherd.prototype.clear = function() {
    this.cache = [];
    this.l = 0;
    this.w = 0;
    this.h = 0;
    this.minX = 0;
    this.minY = 0;
    this.maxX = 0;
    this.maxY = 0;
    this.initX = 0;
    this.initY = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.scale = 1;
    this.steps = 0;
    this.stitchCount = 0;
    this.jumpCount = 0;
    this.tooLongCount = 0;
    this.density = {};
    this.densityWarning = false;
    this.colors = [];
    this.newColor = 0;
    this.oldColor =  this.defaultColor;
	this.penSize = 1;
    this.newPenSize = 0;
    this.bedWarning = 0;
    this.pieceWarning = 0;

    
    //*********************
    // Defaults
    this.restHeight = 10;
    
    // Material
    this.feedRate = 500;
    this.newSpindleSpeed = false;
    this.spindleSpeed = 10000;
    
    // cut depth
    this.defaultCutDepth = -10;
    this.cutDepth = this.defaultCutDepth;
    this.newCutDepth = false;
     
    //*********************
    
};

TurtleShepherd.prototype.loadMaterials = function() {
    var materials = {
        'aluminium':['Aluminium'],
        'acrylic':['Acrylic'],
        'solid':['Solid Surface'],
        'softplastic':['Soft Plastic'],
        'hardplastic':['Hard Plastic'],
        'phenolic':['Phenolic'],
        'laminate':['High Pressure Laminate'],
        'mdf':['MDF / Particle Board'],
        'softwood':['Softwood & Plywood'],
        'hardwood':['Hardwood']
        };

    return materials;
}

TurtleShepherd.prototype.setMaterial = function(material) {
    this.material = material;
}

TurtleShepherd.prototype.getMaterials = function() {
    TurtleShepherd.prototype.loadMaterials();
    return TurtleShepherd.prototype.materialsList;
}

TurtleShepherd.prototype.loadMachines = function() {
    machines = {};
    return machines;
}

// Need to actually make a function of material/drillbit !!!!
TurtleShepherd.prototype.getSafeDepth = function() {
    return 0.2;
}

TurtleShepherd.prototype.toggleMetric = function() {
    return this.metric = !this.metric;

    // Convert defaults to metric or imperial

};

TurtleShepherd.prototype.setMetric = function(b) {
    this.metric = b;
};

TurtleShepherd.prototype.isMetric = function() {
    return this.metric;
};

TurtleShepherd.prototype.getIgnoreColors = function() {
    return this.ignoreColors;
};

TurtleShepherd.prototype.toggleIgnoreColors = function() {
    this.ignoreColors = !this.ignoreColors;
};

TurtleShepherd.prototype.isEmpty = function() {
    return this.steps < 1;
};

TurtleShepherd.prototype.hasSteps = function() {
    return this.steps > 0;
};

TurtleShepherd.prototype.getStepCount = function() {
    return this.steps;
};

TurtleShepherd.prototype.getJumpCount = function() {
    return this.jumpCount;
};

/*
TurtleShepherd.prototype.getTooLongCount = function() {
    return this.tooLongCount;
};

TurtleShepherd.prototype.getTooLongStr = function() {
    if (this.tooLongCount > 1 && !this.ignoreWarning)
		return this.tooLongCount +  " are too long! (will get clamped)"
	else if (this.tooLongCount == 1 && !this.ignoreWarning)
		return this.tooLongCount +  " is too long! (will get clamped)"
	else
		return "";
};

TurtleShepherd.prototype.getDensityWarningStr = function() {
    if (this.densityWarning && !this.ignoreWarning)
		return "DENSITY WARNING!";
	else
		return "";
};
*/

TurtleShepherd.prototype.getDimensions = function() {

	if (this.metric) {
		c = 1;
		unit = "mm";
		//c = 0.1
		//unit = "cm";
	} else {
		c = 1;
		unit = "in";
	}
    w= ((this.maxX - this.minX)/ this.pixels_per_millimeter * c).toFixed(2).toString();
    h= ((this.maxY - this.minY)/ this.pixels_per_millimeter * c).toFixed(2).toString();
	return w + " x " + h + " " + unit;
};

TurtleShepherd.prototype.getMetricWidth = function() {
	c = 1
	return ((this.maxX - this.minX)/ this.pixels_per_millimeter * c).toFixed(2).toString();
};


TurtleShepherd.prototype.getMetricHeight = function() {
	c = 1
	return((this.maxY - this.minY)/ this.pixels_per_millimeter * c).toFixed(2).toString();
};

// Overload method
TurtleShepherd.prototype.moveTo= function(x, y, penState) {
    if (this.newCutDepth) {
        this.pushCutDepthNow();
    }

    this.cache.push(
        {
            "cmd":"move",
            "x":x,
            "y":y,
            "pendown":penState,
            "cutdepth":this.cutDepth
        }
    )
}


TurtleShepherd.prototype.moveTo= function(x1, y1, x2, y2, penState) {
    // ignore jump stitches withouth any previous stitches
    //if (this.steps === 0 && !penState)
	//	return

	warn = false

    if (this.steps === 0) {
        this.initX = x1;
        this.initY = y1;
        this.minX = x1;
        this.minY = y1;
        this.maxX = x1;
        this.maxY = y1;
        /*
        this.cache.push(
            {
                "cmd":"move",
                "x":x1,
                "y":y1,
                "pendown":penState,
                
                // New gcode additions
                "cutdepth":this.cutDepth
            }
        );*/
        this.density[Math.round(x1) + "x" + Math.round(y1)] = 1;
        if (this.colors.length < 1) {
			if (this.newColor) {
				this.colors.push(this.newColor);
			} else {
				this.colors.push(this.defaultColor);
			}
		}
    }

    if (this.newColor) {
		this.pushColorChangeNow();
	}

    if (this.newPenSize) {
		this.pushPenSizeNow();
	}

	if (x2 < this.minX) this.minX = x2;
	if (x2 > this.maxX) this.maxX = x2;
	if (y2 < this.minY) this.minY = y2;
	if (y2 > this.maxY) this.maxY = y2;

	if ( this.calcTooLong && penState) {
    dist = Math.sqrt( (x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1) );
		if ( (dist / this.pixels_per_millimeter * 10) > this.maxLength)
			this.tooLongCount += 1;
	}
    /*
    this.cache.push(
        {
            "cmd":"move",
            "x":x2,
            "y":y2,
            "pendown":penState,
                
            // New gcode additions
            "cutdepth":this.cutDepth
        }
    );*/

    this.l = this.maxX - this.minX;
    this.w = this.maxY - this.minY;
    this.h = this.maxY - this.minY;

    if (!penState)
        this.jumpCount++;
    else {
        this.steps++;
    }

	this.lastX = x2;
	this.lastY = y2;

    // CNC commands
    if (this.newCutDepth) {
        this.pushCutDepthNow();
    }

    this.cache.push(
        {
            "cmd":"move",
            "x":x2,
            "y":y2,
            "pendown":penState,
            "cutdepth":this.cutDepth,
            "feedrate":this.feedRate
        }
    );

    if (warn) {
		warn = false;
		return [x2, y2];
	} else {
		return false;
	}
};


// CNC addition
//***********************************************************

TurtleShepherd.prototype.startCut = function () {

    this.cache.push(
        {
            "cmd":"startcut",
            "cutdepth":this.cutDepth,
            "spindlespeed":this.spindleSpeed,
            "feedrate":this.feedRate
        }
    )
    
}

TurtleShepherd.prototype.stopCut = function () {
    this.cache.push(
        {
            "cmd":"stopcut"
        }
    )
}

TurtleShepherd.prototype.setCutDepth = function(s) {
	this.newCutDepth = s;
};

TurtleShepherd.prototype.pushCutDepthNow = function() {
	n = this.newCutDepth;
	o = this.cutDepth;

    this.cutDepth = this.newCutDepth;
    
	if (n == o) {
		this.newCutDepth = false;
		return;
	}
    if (this.penDown) {
        this.cache.push(
            {
                "cmd":"cutdepth",
                "cutdepth": n
            }
        );
    }
    
    this.newCutDepth = false;
};

TurtleShepherd.prototype.setSpindleSpeed = function(s) {
	this.newSpindleSpeed = s;
};

TurtleShepherd.prototype.pushSpindleSpeedNow = function() {
	n = this.newSpindleSpeed;
	o = this.spindleSpeed;

    this.spindleSpeed = newSpindleSpeed;
    
	if (n == o) {
		this.newSpindleSpeed = false;
		return;
	}
    if (this.penDown) {
        this.cache.push(
            {
                "cmd":"spindlespeed",
                "spindlespeed": n
            }
        );
    }
    
    this.newSpindleSpeed = false;
};

TurtleShepherd.prototype.setSpindleSpeed = function(s) {
	this.newSpindleSpeed = s;
};

TurtleShepherd.prototype.setupWorkpiece = function(material, x, y, z) {
    // Check if machine is already added
    if (workpiece !== undefined) {
        throw new Error("Workpiece already configured");
    }

	this.workpiece.material = material;

    var warning = false,
        machine = this.machine;

    if (machine !== undefined) {
        if (x > this.bedLength) {
            warning = "Workpiece dimensions exceed bed length";
        } else if (y > this.bedWidth) {
            warning = "Workpiece dimensions exceed bed width";
        } else if (z > this.bedHeight) {
            warning = "Workpiece dimensions exceed bed height";
        }
    };
    
    if (warning) {
        throw new Error(warning);
    };

    this.workpiece.dimensions.L = x;
    this.workpiece.dimensions.W = y;
    this.workpiece.dimensions.H = z;
};

TurtleShepherd.prototype.setMachine = function(makeNew, machine, x, y, z) {
    // Check if machine is already added
    if (machine !== undefined) {
        throw new Error("Machine already configured");
    }

    this.machine = machine;

    if (makeNew) {
        this.machines.displayNames[machine] = [machine];
        this.machines[machine] = {
            dimensions : {
                L : x,
                W : y,
                H : z
            }
        }
    };
    
    var machineDim = this.machines[machine].dimensions,
        workDim = this.workpiece.dimensions;

    // Enforce workpiece fits in machine bed
    if (workDim.L > machineDim.L) {
        throw new Error("Machine dimensions are smaller than workpiece");
    } else {
        this.bedLength = machineDim.L
    }

    if (workDim.W > machineDim.W) {
        throw new Error("Machine dimensions are smaller than workpiece");
    } else {
        this.bedLength = machineDim.W
    }

    if (workDim.H > machineDim.H) {
        throw new Error("Machine dimensions are smaller than workpiece");
    } else {
        this.bedLength = dim.H
    }
}


// WARNINGS

TurtleShepherd.prototype.getWorkpieceWarning = function() {
    var warnString = "Warning: cut exceeds workpiece dimensions in ",
        dim = this.workpiece.dimensions;
    if (this.l > dim.L) {
        return warnString.concat("x");
    } else if (this.w > dim.W) {
        return warnString.concat("y");
    } else if (this.h > dim.H) {
        return warnString.concat("z");
    }
    return "";
};

TurtleShepherd.prototype.getRangeWarning = function() {
    var warnString = "Warning: cut exceeds workbed dimensions in ";
    if (this.l > this.bedLength) {
        return warnString.concat("x and has been truncated");
    } else if (this.w > this.bedWidth) {
        return warnString.concat("y and has been truncated");
    } else if (this.h > this.bedHeight) {
        return warnString.concat("z and has been truncated");
    }
    return "";
};
//***********************************************************


TurtleShepherd.prototype.setDefaultColor= function(color) {
	var c = {
		r: Math.round(color.r),
		g: Math.round(color.g),
		b: Math.round(color.b),
		a: color.a
	};
	this.defaultColor = c;
};

TurtleShepherd.prototype.getDefaultColorAsHex = function (){
	return new String(
    "#" + (
      (1 << 24)
    + (Math.round(this.defaultColor.r) << 16)
    + (Math.round(this.defaultColor.g) << 8)
	  + Math.round(this.defaultColor.b)
   ).toString(16).slice(1));
};

TurtleShepherd.prototype.setBackgroundColor= function(color) {
	var c = {
		r: Math.round(color.r),
		g: Math.round(color.g),
		b: Math.round(color.b),
		a: color.a
	};
	this.backgroundColor = c;
};

TurtleShepherd.prototype.getBackgroundColorAsHex = function (){
	return new String(
    "#" + (
      (1 << 24)
    + (Math.round(this.backgroundColor.r) << 16)
    + (Math.round(this.backgroundColor.g) << 8)
	  + Math.round(this.backgroundColor.b)
   ).toString(16).slice(1));
}

TurtleShepherd.prototype.addColorChange= function(color) {
	var c = {
		r: Math.round(color.r),
		g: Math.round(color.g),
		b: Math.round(color.b),
		a: color.a
	};
	this.newColor = c;
};

TurtleShepherd.prototype.pushColorChangeNow = function() {

	c = this.newColor;
	o = this.oldColor;

	if (c.r == o.r && c.g == o.g && c.b == o.b && c.a == o.a) {
		this.newColor = false;
		return;
	}

	index = this.colors.findIndex(x => (x.r == c.r && x.b == x.b && x.g == c.g && x.a == c.a) );

	if (index < 0) {
		index = this.colors.push(this.newColor)-1;
	}

    this.cache.push(
        {
            "cmd":"color",
            "color": this.newColor,
            "thread": index
        }
    );
	this.oldColor = this.newColor;
    this.newColor = false;
};

TurtleShepherd.prototype.setPenSize = function(s) {
	this.newPenSize = s;
};

TurtleShepherd.prototype.pushPenSizeNow = function() {
	n = this.newPenSize;
	o = this.penSize;

	if (n == o) {
		this.newPenSize = false;
		return;
	}
    this.cache.push(
        {
            "cmd":"pensize",
            "pensize": n
        }
    );
	this.penSize = this.newPenSize;
    this.newPenSize = false;
};

TurtleShepherd.prototype.undoStep = function() {
	var last = this.cache.pop();
	if (last.cmd == "move") {
		if (last.penDown) {
			this.steps--;
		} else {
			this.jumpCount--;
		}
	}
};


TurtleShepherd.prototype.toGcode = function() {
    
    var gcodeStr = "$X\n"; // Unlock
    gcodeStr += "$H\n"; // Send to Home

    // Set units of output
    if (this.isMetric()) {
        gcodeStr += "G21\n"; // set units to mm
    } else {
        gcodeStr += "G20\n"; // set units to mm
    }

    // Units selection and origin return
    gcodeStr += "G0 X0 Y0 Z" + (this.restHeight) + "\n"; // Send to origin to prepare for cut
    
    // Read out and store commands from cache
    for (var i=0; i < this.cache.length; i++) {
        if(this.cache[i].cmd == "move") {
            if (this.cache[i].pendown) {
                gcodeStr += "G1 X" + (this.cache[i].x) + " Y" + (this.cache[i].y) + " F" + (this.cache[i].feedrate) + "\n";
            } else {
                gcodeStr += "G0 X" + (this.cache[i].x) + " Y" + (this.cache[i].y) + "\n";
            }
        } else if (this.cache[i].cmd == "cutdepth") {
            if (this.cache[i].cutdepth) {
                gcodeStr += "G1 Z" + (-this.cache[i].cutdepth) + "\n";
            }
        } else if (this.cache[i].cmd == "startcut") {
            gcodeStr += "M3 S" + (this.cache[i].spindlespeed) + "\n";
            gcodeStr += "G4 P" + (this.cache[i].speedup) + "\n";
            gcodeStr += "G1 Z" + (-this.cache[i].cutdepth) + " F" + (this.cache[i].feedrate) + "\n";
        } else if (this.cache[i].cmd == "stopcut") {
            gcodeStr += "G0 Z" + (this.restHeight) + "\n";
        }
    }
    
    gcodeStr += "$H\n"
    gcodeStr += "M30"

    return gcodeStr;
};

TurtleShepherd.prototype.debug_msg = function (st, clear) {
	o = "";
	if (!clear) {
		o = document.getElementById("debug").innerHTML;
	} else {
		o = "";
	}
	o = st + "<br />" + o;
	document.getElementById("debug").innerHTML = o;
};
