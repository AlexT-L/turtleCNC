/*
    TurtleShepherd
    ------------------------------------------------------------------
    turltestich's embroidery intelligence agency
    Embroidery function for Javscript
    ------------------------------------------------------------------
    Copyright (C) 2016-2017 Michael Aschauer

*/

// Create default libraries (units are in mm by default, converted to in if needed)

var PI = Math.PI;

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

materials.chipLoad = {
    'aluminium' : [0, ((0.13-0.08)/2), ((0.13-0.08)/2), ((0.20-0.15)/2), ((0.26-0.20)/2), ((0.26-0.20)/2)], // done
    'acrylic' : [0, ((0.15-0.08)/2), ((0.26-0.18)/2), ((0.31-0.26)/2), ((0.41-0.31)/2), ((0.41-0.31)/2)], // done
    'solid' : [0, ((0.10-0.05)/2), ((0.23-0.15)/2), ((0.26-0.20)/2), ((0.31-0.26)/2), ((0.31-0.26)/2)], // done
    'softplastic' : [0, ((0.15-0.08)/2), ((0.26-0.18)/2), ((0.31-0.26)/2), ((0.41-0.31)/2), ((0.41-0.31)/2)], // done
    'hardplastic' : [0, ((0.10-0.05)/2), ((0.23-0.15)/2), ((0.26-0.20)/2), ((0.31-0.26)/2), ((0.31-0.26)/2)], // done
    'phenolic' : [0, ((0.13-0.10)/2), ((0.31-0.28)/2), ((0.46-0.43)/2), ((0.66-0.61)/2), ((0.66-0.61)/2)], // done
    'Laminate' : [0, ((0.13-0.08)/2), ((0.28-0.23)/2), ((0.46-0.41)/2), ((0.54-0.48)/2), ((0.54-0.48)/2)], // done
    'mdf' : [0, ((0.18-0.10)/2), ((0.41-0.33)/2), ((0.59-0.51)/2), ((0.69-0.64)/2), ((0.69-0.64)/2)], // done
    'softwood' : [0, ((0.15-0.10)/2), ((0.33-0.28)/2), ((0.51-0.43)/2), ((0.59-0.54)/2), ((0.59-0.54)/2)], //done
    'hardwood' : [0, ((0.13-0.08)/2), ((0.28-0.23)/2), ((0.46-0.41)/2), ((0.54-0.48)/2), ((0.54-0.48)/2)], // done
    'steel' : [0, ((0.13-0.08)/2), ((0.26-0.20)/2), ((0.31-0.26)/2), ((0.41-0.31)/2), ((0.41-0.31)/2)], // done
    'composites' : [0, ((0.13-0.08)/2), ((0.31-0.23)/2), ((0.46-0.41)/2), ((0.64-0.59)/2), ((0.64-0.59)/2)], // done
    'diameters' : [0, 3, 6, 10, 13, 1000],
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
    this.defaultCutDepth = 0;
    this.tabHeight = 5;
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
    this.ignoreWarning = false;

    // Drilling parameters
    this.speedup = 2; // Speed up time (s)

    // Material
    this.material;

    // Machine
    this.machine;

    // Tabs
    this.tabHeight = 5;
    
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
    this.minZ = 0;
    this.maxX = 0;
    this.maxY = 0;
    this.maxZ = 0;
    this.initX = 0;
    this.initY = 0;
    this.initZ = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.lastZ = 0;
    this.scale = 1;
    this.steps = 0;
	this.penSize = 1;
    this.newPenSize = 0;
    
    //*********************
    // Defaults
    this.restHeight = 5;
    
    // Material
    this.feedRate = 500;
    this.newSpindleSpeed = false;
    this.spindleSpeed = 10000;

    // tool
    this.tool = false;
    
    // cut depth
    this.cutDepth = this.defaultCutDepth;     

    // Tabs
    this.tabs = [];
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

TurtleShepherd.prototype.getMaterials = function() {
    TurtleShepherd.prototype.loadMaterials();
    return TurtleShepherd.prototype.materialsList;
}

TurtleShepherd.prototype.loadMachines = function() {
    machines = {};
    return machines;
}

TurtleShepherd.prototype.getChipLoad = function() {
    if (this.tool && this.workpiece) {
        let mat = this.workpiece.material,
            diams = this.materials.chipLoad['diameter'],
            loads = this.materials.chipLoad[mat];

        for (let i = 1; i < diams.length; i++) {
            let d1 = diams[i-1], d2 = diams[i],
                l1 = loads[i-1], l2 = loads[i],
                s = this.tool.size;

            if ( s > d1 && s < d2 ) {
                let ds = (s-d1)/(d2-d1),
                    dl = l1 + ds*(l2-l1);

                return dl;
            }
        }
        
        throw new Error("Tool diameter must be between 0 and 10cm");
    }
    
    throw new Error("Must set tool and material");
}

// Need to actually make a function of material/drillbit !!!!
TurtleShepherd.prototype.getSafeDepth = function() {
    return 2;
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

TurtleShepherd.prototype.isEmpty = function() {
    return this.steps < 1;
};

TurtleShepherd.prototype.hasSteps = function() {
    return this.steps > 0;
};

TurtleShepherd.prototype.getStepCount = function() {
    return this.steps;
};

TurtleShepherd.prototype.getCutDimensions = function() {

	if (this.metric) {
		c = 1;
		unit = "mm";
	} else {
		c = 1;
		unit = "in";
	}
    l= ((this.maxZ - this.minZ)/ this.pixels_per_millimeter * c).toFixed(2).toString();
    w= ((this.maxX - this.minX)/ this.pixels_per_millimeter * c).toFixed(2).toString();
    //h= ((this.maxY - this.minY)/ this.pixels_per_millimeter * c).toFixed(2).toString();
    h = this.getHeight().toFixed(2).toString();
	return l + " x " + w + " x " + h + " " + unit;
};

TurtleShepherd.prototype.getHeight = function() {
    if (this.workpiece === undefined) {
        return 0;
    }
    return this.workpiece.dimensions.H;
};

TurtleShepherd.prototype.getBedDimensions = function() {

    if (this.machine === undefined) {
        return "0 x 0 x 0";
    }

	if (this.metric) {
		c = 1;
		unit = "mm";
	} else {
		c = 1;
		unit = "in";
	}

    l= (this.bedLength * c).toFixed(2).toString();
    w= (this.bedWidth * c).toFixed(2).toString();
    h= (this.bedHeight * c).toFixed(2).toString();
	return l + " x " + w + " x " + h + " " + unit;
};


TurtleShepherd.prototype.getMetricWidth = function() {
	c = 1
	return ((this.maxX - this.minX)/ this.pixels_per_millimeter * c).toFixed(2).toString();
};


TurtleShepherd.prototype.getMetricHeight = function() {
	c = 1
	return((this.maxY - this.minY)/ this.pixels_per_millimeter * c).toFixed(2).toString();
};

TurtleShepherd.prototype.moveTo= function(x1, y1, x2, y2, penState, depthchange) {
    // Set depthChange to zero if undefined
    let depthChange;
    if (depthchange === undefined) { 
        depthChange = 0;
    } else { depthChange = depthchange};

	warn = false;

    if (this.steps === 0) {
        this.initX = x1;
        this.initY = y1;
        this.minX = x1;
        this.minY = y1;
        this.maxX = x1;
        this.maxY = y1;
    }

    if (this.newPenSize) {
		this.pushPenSizeNow();
	}

	if (x2 < this.minX) this.minX = x2;
	if (x2 > this.maxX) this.maxX = x2;
	if (y2 < this.minY) this.minY = y2;
	if (y2 > this.maxY) this.maxY = y2;

    this.l = this.maxX - this.minX;
    this.w = this.maxY - this.minY;
    this.h = this.maxY - this.minY;

    if (penState) {
        this.steps++;
    }

	this.lastX = x2;
	this.lastY = y2;

    // CNC command
    this.cache.push(
        {
            "cmd":"move",
            "x1":x1,
            "y1":y1,
            "x2":x2,
            "y2":y2,
            "pendown":penState,
            "cutdepth":this.cutDepth,
            "depthchange":depthChange
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

TurtleShepherd.prototype.arcTo = function(x1, y1, r, theta1, theta2, clockwise, penState, depthchange ) {
    // Set depthChange to zero if undefined
    let depthChange;
    if (depthchange === undefined) { 
        depthChange = 0;
    } else { depthChange = depthchange};

	warn = false;

    if (this.steps === 0) {
        this.initX = x1;
        this.initY = y1;
        this.minX = x1;
        this.minY = y1;
        this.maxX = x1;
        this.maxY = y1;
    }

    if (this.newPenSize) {
		this.pushPenSizeNow();
	}
    /*
	if (x2 < this.minX) this.minX = x2;
	if (x2 > this.maxX) this.maxX = x2;
	if (y2 < this.minY) this.minY = y2;
	if (y2 > this.maxY) this.maxY = y2;
    */
    this.l = this.maxX - this.minX;
    this.w = this.maxY - this.minY;
    this.h = this.maxY - this.minY;

    if (penState) {
        this.steps++;
    }

	//this.lastX = x2;
	//this.lastY = y2;

    // CNC command
    let radians = (Math.PI / 180) * theta1,
        xc = x1 - r*Math.cos(radians),
        yc = y1 - r*Math.sin(radians);

    this.cache.push(
        {
            "cmd":"arc",
            "xc":xc,
            "yc":yc,
            "r":r,
            "theta1":theta1,
            "theta2":theta2,
            "clockwise":clockwise,
            "pendown":penState,
            "cutdepth":this.cutDepth,
            "depthchange":depthChange
        }
    );

    if (warn) {
		warn = false;
		return [x1, y1];
	} else {
		return false;
	}
};

TurtleShepherd.prototype.startCut = function (x, y) {
    this.penDown = true;
    this.cache.push(
        {
            "cmd":"startcut",
            "x":x,
            "y":y,
            "cutdepth":this.cutDepth
        }
    )
}

TurtleShepherd.prototype.stopCut = function () {
    this.penDown = false;
    this.cache.push(
        {
            "cmd":"stopcut"
        }
    )
}

TurtleShepherd.prototype.setCutDepth = function(s) {
	n = s;
	o = this.cutDepth;

    this.cutDepth = s;
    
	if (n == o) {
		return;
	}
    if (this.penDown) {
        this.cache.push(
            {
                "cmd":"cutdepth",
                "cutdepth": n,
                "x":0,
                "y":0
            }
        );
    }
};


TurtleShepherd.prototype.setTool = function(diameter, edges) {
    this.tool = {
        size : diameter,
        flutes : edges
    }
}

TurtleShepherd.prototype.getToolSize = function() {
    if (this.tool.size === undefined) {
        throw new Error('Tool size not set!');
    };

    return this.tool.size;
}

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
    
	this.workpiece = {
        material : material,
        dimensions : {
            L : x,
            W : y,
            H : z
        }
    };
};

TurtleShepherd.prototype.setMachine = function(makeNew, machine, x, y, z) {

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

    var machineDim = this.machines[machine].dimensions;

    if (this.workpiece) {
        var workDim = this.workpiece.dimensions;

        // Enforce workpiece fits in machine bed
        if (workDim.L > machineDim.L) {
            throw new Error("Machine dimensions are smaller than workpiece");
        }
        if (workDim.W > machineDim.W) {
            throw new Error("Machine dimensions are smaller than workpiece");
        } 
        if (workDim.H > machineDim.H) {
            throw new Error("Machine dimensions are smaller than workpiece");
        }
    }

    this.bedLength = machineDim.L;
    this.bedWidth = machineDim.W;
    this.bedHeight = machineDim.H;


    if(makeNew && (!x || !y || !z)) {
        throw new Error("Dimensions must be non-zero!")
    };
}

// TAB CREATION

TurtleShepherd.prototype.addTab = function(x, y, l, w, angle) {
    
    // Create rectangle at origin rotated by angle, and translate to (x,y)
    let radians = (Math.PI / 180) * angle,
        buffer = this.getToolSize()/2; // offset
        v1 = this.translate(this.rotateOrigin(-(l/2+buffer), -(w/2+buffer), radians), x, y),
        v2 = this.translate(this.rotateOrigin(  l/2+buffer , -(w/2+buffer), radians), x, y),
        v3 = this.translate(this.rotateOrigin(  l/2+buffer ,   w/2+buffer , radians), x, y),
        v4 = this.translate(this.rotateOrigin(-(l/2+buffer),   w/2+buffer , radians), x, y),
        tab = [];

    // Turn vertices into array of sides in vector form
    tab[0] = [ v1, [v2[0]-v1[0], v2[1]-v1[1]] ];
    tab[1] = [ v2, [v3[0]-v2[0], v3[1]-v2[1]] ];
    tab[2] = [ v3, [v4[0]-v3[0], v4[1]-v3[1]] ];
    tab[3] = [ v4, [v1[0]-v4[0], v1[1]-v4[1]] ];

    this.tabs.push([tab]);
};

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
		}
	}
};

// G-code Extraction

// Need to write function !!!
TurtleShepherd.prototype.getFeedRate = function() {
    return 1000;
};

TurtleShepherd.prototype.getSpindleSpeed = function() {
    return 1000;
};

// Need to adjust to mm / in !!!
TurtleShepherd.prototype.getTabHeight = function() {
    return this.tabHeight;
}

TurtleShepherd.prototype.drillIntoTab = function(x, y, cutDepth) {
    if (cutDepth > (this.workpiece.dimensions.H - this.getTabHeight())) {
        return this.isInTab(x,y);
    };
    return false;
}

TurtleShepherd.prototype.getFreeLine = function(x1, y1, x2, y2, cutDepth, depthchange) {
    // Tolerance
    let tol = 0.0001;

    let depthChange;
    if (depthchange === undefined) {
        depthChange = 0;
    } else { depthChange = depthchange };

    return this.getFreePathRecursive(x1, y1, x2, y2, cutDepth, depthChange, tol, this.copyTabs());
};

TurtleShepherd.prototype.getFreePathRecursive = function(x1, y1, x2, y2, cutDepth, depthchange, tolerance, tabs) {

    let depthChange = depthchange,
        tol = tolerance,
        tabsToCheck = tabs,
        tabCutHeight = -(this.workpiece.dimensions.H - this.getTabHeight());

    if (depthChange === undefined) {depthChange = 0};

    if (!tabsToCheck.length) { // No tabs, we're fine
        return "G1 Z" + (-cutDepth) + "\n" + this.lineCut(x2, y2, depthChange);
    };
    
    let int = [], // array of intersections
        x00 = x1, x01 = x2-x1, y00 = y1, y01 = y2-y1; // Cut to be made, parametrized

    // pop off another tab and check it
    var tab = tabsToCheck.pop().pop();

    for (let i = 0; i < tab.length; i++) {
        let edge = tab[i],
            x10 = edge[0][0],
            x11 = edge[1][0],
            y10 = edge[0][1],
            y11 = edge[1][1],
            det = x11 * y01 - x01 * y11;
    
        if (det === 0) { continue; };

        let s = (1/det) * ((x00 - x10)*y01 - (y00 - y10)*x01),
            t = (1/det) * ((x00 - x10)*y11 - (y00 - y10)*x11);

        if ((s >= 0) && (s <= 1)) {
            if ((t >= 0) && (t <= 1)) {
                int.push([t]);
            }
        };
    };

    
    // No intersections means are either entirely inside or outside tab
    // if we are in tab, don't make cut (still allows vertical drill into tab)
    if (int.length == 0) {
        if (this.isInTab(x1, y1, tab) && this.isInTab(x2, y2, tab)) {
            return "G1 Z" + tabCutHeight + "\nG1 X" + x2 + " Y" + y2 + "\n";
        };
        return this.getFreePathRecursive(x1, y1, x2, y2, cutDepth, depthChange, tol, this.copyTabs(tabsToCheck));
    };
    
    // One intersection means we start or end in tab
    if (int.length == 1) {
        let s = int[0][0],
            xInt = x1 + x01*s, 
            yInt = y1 + y01*s;

        // start on tab 
        if (this.isOnTab(x1, y1, tab)) {
            //let output = ("G1 Z" + (-cutDepth - depthChange*s) + "\n"); // Put spindle down to continue cut
            return  this.getFreePathRecursive(x1, y1, x2, y2, cutDepth, depthChange*(1-s), tol, this.copyTabs(tabsToCheck)); // Check next segment
        };

        // end on tab
        if (this.isOnTab(x2, y2, tab)) {
            let output = this.getFreePathRecursive(x1, y1, x2, y2, cutDepth, depthChange*s, tol, this.copyTabs(tabsToCheck));
            return "" + output;// + ("G1 Z" + tabCutHeight + "\n");
        };

        // start (strictly) in tab
        if (this.isInTab(x1, y1, tab)) {
            let output = "G1 Z" + tabCutHeight + "\n" + this.lineCut(xInt, yInt); // Get out of tab
            //output += ("G1 Z" + (-cutDepth - depthChange*s) + "\n"); // Put spindle down to continue cut
            return  output + this.getFreePathRecursive(xInt, yInt, x2, y2, cutDepth, depthChange*(1-s), tol, this.copyTabs(tabsToCheck)); // Check next segment
        };
        
        // end (strictly) in tab - find free path to tab
        let output = this.getFreePathRecursive(x1, y1, xInt, yInt, cutDepth, depthChange*s, tol, this.copyTabs(tabsToCheck));
        return "" + output + ("G1 Z" + tabCutHeight + "\n") + this.lineCut(x2, y2);
    };
    
    // More than one intersection means we start and end outside of tab
    if (int.length > 1) {
        // Only really 1-2 intersections (we can get more than 2 if we cross a corner)
        let minS = Math.min.apply(Math, int), 
            maxS = Math.max.apply(Math, int),
            output = "";
        
        // first cut segment
        let xInt = x1 + x01*minS, 
            yInt = y1 + y01*minS;
        output += this.getFreePathRecursive(x1, x2, xInt, yInt, cutDepth, depthChange*minS, tol, this.copyTabs(tabsToCheck));
        output += ("G1 Z" + tabCutHeight + "\n");
        
        // traverse tab
        xInt = x1 + x01*maxS;
        yInt = y1 + y01*maxS;
        output += this.lineCut(xInt, yInt);
        
        // second cut segment
        //output += "G1 Z" + (-cutDepth - depthChange*maxS) + "\n";
        output += this.getFreePathRecursive(xInt, yInt, x2, y2, cutDepth, depthChange*(1-maxS), tol, this.copyTabs(tabsToCheck));
        
        // return cuts
        return output;
    };
}

TurtleShepherd.prototype.lineCut = function(x2, y2, depthchange, currentDepth) {
    let depthChange = depthchange,
        depth = currentDepth;
    if (depthChange === undefined) { 
            depthChange = 0;
            depth = 0;
    };

    if (depthChange) {
        depth = Math.min(this.workpiece.dimensions.H, depthChange + depth);
        return "G1 X" + x2 + " Y" + y2 + " Z" + (-depth) + " //depthChange\n";
    };
    
    return "G1 X" + x2 + " Y" + y2 + "\n";
};

TurtleShepherd.prototype.getFreeArc = function(xc, yc, r, theta1, theta2, clockwise, cutDepth, depthchange) {
    // Tolerance
    let theta1Rad = (Math.PI / 180) * theta1,
        theta2Rad = (Math.PI / 180) * theta2,
        tol = 0.0001;

    let depthChange;
    if (depthchange === undefined) {
        depthChange = 0;
    } else { depthChange = depthchange };

    return this.getFreeArcRecursive(xc, yc, r, theta1Rad, theta2Rad, clockwise, cutDepth, depthchange,  tol, this.copyTabs());
};

TurtleShepherd.prototype.getFreeArcRecursive = function(xc, yc, r, theta1, theta2, clockwise, cutDepth, depthchange,  tolerance, tabs) {
    let X1 = xc + r*Math.cos(theta1),
        Y1 = yc + r*Math.sin(theta1),
        X2 = xc + r*Math.cos(theta2),
        Y2 = yc + r*Math.sin(theta2);

    let depthChange = depthchange,
        tol = tolerance,
        tabsToCheck = tabs,
        tabCutHeight = -(this.workpiece.dimensions.H - this.getTabHeight());

    if (depthChange === undefined) {depthChange = 0};

    let endDepth = depthChange ? (cutDepth+ depthChange) : 0;

    if (!tabsToCheck.length) { // No tabs, we're fine
        return "//843 No tabs G1 Z" + (-cutDepth) + "\n" + this.arcCutRadius(r, X2, Y2, clockwise, endDepth);
    };
    
    // Check first tab
    let int = []; // array of intersection angles

    // pop off another tab and check it
    let tab = tabsToCheck.pop().pop();

    for (let i = 0; i < 4; i++) {
                
        let edge = tab[i],
            u = edge[0],
            v = edge[1],
            c = [xc, yc],
            uc = this.minus(c, u),
            dist = Math.abs(this.cross(uc, v)) / this.norm(v);

        if (dist > r) {continue};

        // rotate edge of tab so that it's horizontal
        let phi = Math.acos(v[0]/this.norm(v)) * this.sign(v[1]),
            u0 = this.rotatePoint(u, c, -phi),
            v0 = this.rotatePoint(v, c, -phi);
                
        // find radius of slice of circle
        let h = u0[1] - yc,
            d = Math.sqrt(r*r - h*h);

        /*// determine if line intersects
        let s1 = ((xc-d)-u0[0]) / v0[0],
            s2 = ((xc+d)-u0[0]) / v0[0],
            phi1 = Math.acos(-d/r) * this.sign(h),
            phi2 = Math.acos(d/r) * this.sign(h);*/

        // rotate intersection points back into global coordinate system
        // then check if they are on line
        let p1 = this.rotatePoint([(xc-d), (yc+h)], c, phi),
            p2 = this.rotatePoint([(xc+d), (yc+h)], c, phi),
            s1 = this.norm(this.minus(p1,u)) / this.norm(v),
            s2 = this.norm(this.minus(p2,u)) / this.norm(v),
            phi1 = Math.acos(-d/r) * this.sign(h),
            phi2 = Math.acos(d/r) * this.sign(h);
                
        if (s1 >= 0 && s1 <= 1) {
            let thetaInt = (phi + phi1 + 2*PI) % (2*PI);

            if (clockwise) {
                if ( ((theta1 + 2*PI) % (2*PI) > thetaInt) && ((theta2 + 2*PI) % (2*PI) < thetaInt) ) {
                    int.push([thetaInt]);
                }
            } else {
                if ( ((theta1 + 2*PI) % (2*PI) > thetaInt) && ((theta2 + 2*PI) % (2*PI) < thetaInt) ) {
                    int.push([thetaInt]);
                }
            }
        }

        if (s2 >= 0 && s2 <= 1) {
            let thetaInt = (phi + phi2 + 2*PI) % (2*PI);

            if (clockwise) {
                if ( ((theta1 + 2*PI) % (2*PI) > thetaInt) && ((theta2 + 2*PI) % (2*PI) < thetaInt) ) {
                    int.push([thetaInt]);
                }
            } else {
                if ( ((theta1 + 2*PI) % (2*PI) < thetaInt) && ((theta2 + 2*PI) % (2*PI) > thetaInt) ) {
                    int.push([thetaInt]);
                }
            }
        };
    };

    // No intersections means are either entirely inside or outside tab
    // if we are in tab, don't make cut
    if (int.length == 0) {
        let startTab = (this.isInTab(X1, Y1, tab) || this.isOnTab(X1, Y1, tab)),
            endTab = (this.isInTab(X2, Y2, tab) || this.isOnTab(X1, Y1, tab));

        if (startTab || endTab) {
            let midx = X1 + (X2-X1)/2,
                midy = Y1 + (Y2-Y1)/2;

            if (this.isInTab(midx, midy, tab) || this.isOnTab(midx, midy, tab)) { // inside tab - move up and cut from safe height
                let part1 = "//942 Completely in tab\nG1 Z" + tabCutHeight + "\n";
                return part1 + this.arcCutRadius(r, X2, Y2, clockwise, false);
            }
            else {
                //let part1 = "//946 G1 Z" + (-cutDepth) + "\n";
                return this.getFreeArcRecursive(xc, yc, r, theta1, theta2, clockwise, cutDepth, depthChange,  tolerance, this.copyTabs(tabsToCheck));
            }
        }
        else {
            return this.getFreeArcRecursive(xc, yc, r, theta1, theta2, clockwise, cutDepth, depthChange,  tolerance, this.copyTabs(tabsToCheck));
        }
    };

    if (int.length == 1) {
        let x1 = X1, y1 = Y1, x2 = X2, y2 = Y2,
            thetaInt = int[0],
            xInt = xc + r*Math.cos(thetaInt),
            yInt = yc + r*Math.sin(thetaInt);

        // start on tab 
        if (this.isOnTab(x1, y1, tab)) {
            let output = ("G1 Z" + (-cutDepth) + "\n"); // Put spindle down to continue cut
            return  output + this.getFreeArcRecursive(xc, yc, r, theta1, theta2, clockwise, cutDepth, depthChange,  tolerance, this.copyTabs(tabsToCheck));
        };

        // end on tab
        if (this.isOnTab(x2, y2, tab)) {
            let output = this.getFreeArcRecursive(xc, yc, r, theta1, theta2, clockwise, cutDepth, depthChange,  tolerance, this.copyTabs(tabsToCheck));
            return "" + output + ("G1 Z" + tabCutHeight + "\n");
        };

        // start (strictly) in tab
        if (this.isInTab(x1, y1, tab)) {
            let output = "G1 Z" + tabCutHeight + "\n" + this.arcCutRadius(r, xInt, yInt, clockwise, false);
            output += ("G1 Z" + (-cutDepth) + "\n"); // Put spindle down to continue cut
            return  output + this.getFreeArcRecursive(xc, yc, r, thetaInt, theta2, clockwise, cutDepth, depthChange,  tolerance, this.copyTabs(tabsToCheck)); // Check next segment
        };
        
        // end (strictly) in tab - find free path to tab
        let output = this.getFreeArcRecursive(xc, yc, r, theta1, thetaInt, clockwise, cutDepth, depthChange,  tolerance, this.copyTabs(tabsToCheck));
        return "" + output + ("G1 Z" + tabCutHeight + "\n") + this.arcCutRadius(r, x2, y2, clockwise, false);
    };

    if (int.length > 1) {
        // Only really 1-2 intersections (we can get more than 2 if we cross a corner)
        let thetaInt1 = clockwise ? Math.max.apply(Math, int) : Math.min.apply(Math, int), 
            thetaInt2 = clockwise ? Math.min.apply(Math, int) : Math.max.apply(Math, int),
            xInt1 = xc + r*Math.cos(thetaInt1),
            yInt1 = yc + r*Math.sin(thetaInt1),
            xInt2 = xc + r*Math.cos(thetaInt2),
            yInt2 = yc + r*Math.sin(thetaInt2),
            output = "";
        
        // first cut segment
        output += this.getFreeArcRecursive(xc, yc, r, theta1, thetaInt1, clockwise, cutDepth, depthChange,  tolerance, this.copyTabs(tabsToCheck));
        output += ("G1 Z" + tabCutHeight + "\n");
        
        // traverse tab
        output += this.arcCutRadius(r, xInt2, yInt2, clockwise, false);
        
        // second cut segment
        //output += "G1 Z" + (-cutDepth) + "\n";
        output += this.getFreeArcRecursive(xc, yc, r, thetaInt2, theta2, clockwise, cutDepth, depthChange,  tolerance, this.copyTabs(tabsToCheck));
        
        // return cuts
        return output;
    };

};

TurtleShepherd.prototype.arcCut = function(xc0, yc0, x2, y2, Clockwise, endDepth) {
    // clockwise is default
    let clockwise = Clockwise;
    if (clockwise === undefined) {
        clockwise = true;
    };
    
    if (clockwise) {
        return "G2 X" + x2 + " Y" + y2 + " I" + xc0 + " J" + yc0 + "\n";
    }
    
    return "G3 X" + x2 + " Y" + y2 + " I" + xc0 + " J" + yc0 + "\n";
};

TurtleShepherd.prototype.arcCutRadius = function(r, x2, y2, Clockwise, endDepth) {
    // clockwise is default
    let clockwise = Clockwise;
    if (clockwise === undefined) {
        clockwise = true;
    };
    
    if (clockwise) {
        return "G2 X" + x2 + " Y" + y2 + " R" + r + "\n";
    }
    
    return "G3 X" + x2 + " Y" + y2 + " R" + r + "\n";
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
    
    // Debugging info
    /*
    let temp = this.copyTabs(this.copyTabs());
    gcodeStr += "//Number of tabs: " + temp.length + "\n";
    if (temp.length) {
        gcodeStr += "//Tabs corners at:\n";
        while (temp.length) {
            let tab = temp.pop().pop(),
                edge1 = tab.pop(),
                edge2 = tab.pop(),
                edge3 = tab.pop(),
                edge4 = tab.pop();
            gcodeStr += "x: " + edge1[0][0] + " y: " + edge1[0][1] + "\n";
            gcodeStr += "x: " + edge2[0][0] + " y: " + edge2[0][1] + "\n";
            gcodeStr += "x: " + edge3[0][0] + " y: " + edge3[0][1] + "\n";
            gcodeStr += "x: " + edge4[0][0] + " y: " + edge4[0][1] + "\n\n";
        };
    };*/
    
    // Units selection and origin return
    gcodeStr += "G0 X0 Y0 Z" + (this.restHeight) + "\n"; // Send to origin to prepare for cut
    gcodeStr += "G1 F" + this.getFeedRate() + "\n"; // Set feed rate
    gcodeStr += "M3 S" + (this.getSpindleSpeed()) + "\n";
    gcodeStr += "G4 P" + (this.speedup) + "\n";
    
    let tabDepth = this.workpiece.dimensions.H - this.getTabHeight();

    // Read out and store commands from cache
    for (var i=0; i < this.cache.length; i++) {
    
        if(this.cache[i].cmd == "move") {
            if (this.cache[i].pendown) {
                let x1 = this.cache[i].x1,
                    y1 = this.cache[i].y1,
                    x2 = this.cache[i].x2,
                    y2 = this.cache[i].y2,
                    cutDepth = this.cache[i].cutdepth,
                    depthChange = this.cache[i].depthchange;
                    
                if ( (cutDepth > tabDepth) || (cutDepth + depthChange > tabDepth) ) {
                    gcodeStr += this.getFreeLine(x1, y1, x2, y2, cutDepth, depthChange);
                } else {
                    gcodeStr += "G1 X" + x2 + " Y" + y2 + " Z" + (-cutDepth-depthChange) + "\n";
                }
            } else {
                gcodeStr += "G0 X" + (this.cache[i].x2) + " Y" + (this.cache[i].y2) + "\n";
            }
        } 

        else if (this.cache[i].cmd == "arc") {
            let xc = this.cache[i].xc,
                yc = this.cache[i].yc,
                r = this.cache[i].r,
                theta1 = this.cache[i].theta1,
                theta2 = this.cache[i].theta2,
                clockwise = this.cache[i].clockwise,
                cutDepth = this.cache[i].cutdepth,
                depthChange = this.cache[i].depthchange,
                theta1Rad = (Math.PI / 180) * theta1,
                theta2Rad = (Math.PI / 180) * theta2,
                x1 = xc + r*Math.cos(theta1Rad),
                y1 = yc + r*Math.sin(theta1Rad),
                x2 = xc + r*Math.cos(theta2Rad),
                y2 = yc + r*Math.sin(theta2Rad),
                endDepth = depthChange ? (cutDepth + depthChange) : false;
            
            if (this.cache[i].pendown) {

                if ( (cutDepth > tabDepth) || (cutDepth + depthChange > tabDepth) ) {
                    gcodeStr += this.getFreeArc(xc, yc, r, theta1, theta2, clockwise, cutDepth, depthChange);
                    gcodeStr += "G1 Z" + Math.max(-tabDepth, -cutDepth) + "\n";
                    gcodeStr += "G1 X" + x2 + " Y" + y2 + "\n";
                } else {
                    gcodeStr += this.arcCutRadius(r, x2, y2, clockwise, endDepth);
                    gcodeStr += "G1 Z" + Math.max(-tabDepth, -cutDepth) + "\n";
                    gcodeStr += "G1 X" + x2 + " Y" + y2 + "\n";
                }
            }
            else {
                gcodeStr += this.arcCutRadius(r, x2, y2, clockwise, endDepth);
                gcodeStr += "G1 Z" + Math.max(-tabDepth, -cutDepth) + "\n";
                gcodeStr += "G1 X" + x2 + " Y" + y2 + "\n";
            }
        }
        
        else if (this.cache[i].cmd == "cutdepth") {
            if (this.drillIntoTab(this.cache[i].x, this.cache[i].y, this.cache[i].cutdepth)) {
                gcodeStr += "G1 Z" + (-tabDepth) + "\n";
            } else {
                gcodeStr += "// cutdepth change G1 Z" + (-this.cache[i].cutdepth) + "\n";
            }
        } 
        
        else if (this.cache[i].cmd == "startcut") {
            if (this.drillIntoTab(this.cache[i].x, this.cache[i].y, this.cache[i].cutdepth)) {
                gcodeStr += "G1 Z" + (-tabDepth) + "\n";
            } else {
                gcodeStr += "// start cut G1 Z" + (-this.cache[i].cutdepth) + "\n";
            }
        } 
        
        else if (this.cache[i].cmd == "stopcut") {
            gcodeStr += "// stop cutG0 Z" + (-this.restHeight) + "\n";
        }
    };
    
    gcodeStr += "$H\n";
    gcodeStr += "M30";
    
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

// Geometric operations

TurtleShepherd.prototype.rotateOrigin = function(x, y, angle) {
    let cos = Math.cos(angle),
        sin = Math.sin(angle),
        nx = (cos * x) - (sin * y),
        ny = (cos * y) + (sin * x);
    return [nx, ny];
}

TurtleShepherd.prototype.rotatePoint = function(Point, center, angle) {
    let x = Point[0], y = Point[1],
        cx = center[0], cy = center[1],
        [rx, ry] = this.rotateOrigin((x-cx), (y-cy), angle);
    return [(cx+rx), (cy+ry)];
}

TurtleShepherd.prototype.plus = function(Point1, Point2) {
    let x0 = Point1[0], y0 = Point1[1],
        x1 = Point2[0], y1 = Point2[1],
        diff = [x1+x0, y1+y0];
    return diff;
}

TurtleShepherd.prototype.minus = function(Point1, Point2) {
    let x0 = Point1[0], y0 = Point1[1],
        x1 = Point2[0], y1 = Point2[1],
        diff = [x1-x0, y1-y0];
    return diff;
}

TurtleShepherd.prototype.dot = function(Point1, Point2) {
    let x0 = Point1[0], y0 = Point1[1],
        x1 = Point2[0], y1 = Point2[1],
        d = x0*x1 + y0*y1;
    return d;
}

TurtleShepherd.prototype.cross = function(Point1, Point2) {
    let u1 = Point1[0], u2 = Point1[1],
        v1 = Point2[0], v2 = Point2[1];
    return u1*v2 - u2*v1;
}

TurtleShepherd.prototype.norm = function(Point) {
    let x0 = Point[0],
        y0 = Point[1],
        d = Math.sqrt(x0*x0 + y0*y0);
    return d;
}

TurtleShepherd.prototype.scalePoint = function(Point, s) {
//return [0, 0];
    let x0 = Point[0],
        y0 = Point[1],
        x = x0*s, y = y0*s;
    return [x, y];
}

TurtleShepherd.prototype.sign = function(a) {
    if (a < 0) {return -1};
    if (a > 0) {return 1};
    return 0;
}

TurtleShepherd.prototype.translate = function(Point, x, y) {
    let x0 = Point[0],
        y0 = Point[1],
        nx = x0 + x,
        ny = y0 + y;
    return [nx, ny];
}

TurtleShepherd.prototype.calcAngle = function(x1, y1, x2, y2) {
    return Math.atan2( (y2-y1), (x2-x1) )
}

TurtleShepherd.prototype.negative = function(array) {
    for (let i = 0; i < array.length; i++) {
        array[i] = -array[i];
    }
    return array;
}

TurtleShepherd.prototype.isInTab = function(x, y, tab) {
    return (this.sideOfTab(x,y,tab) < 0);
}

TurtleShepherd.prototype.isOnTab = function(x, y, tab) {
    return (this.sideOfTab(x,y,tab) == 0);
}

TurtleShepherd.prototype.sideOfTab = function(x, y, atab) {
    let tabsOfInterest = [];

    if (atab) { tabsOfInterest.push([atab]) }
    else {tabsOfInterest = this.tabs};

    for (let i = 0; i < tabsOfInterest.length; i++) {
        let tab = tabsOfInterest[i][0],
            outside = false, // Is point to the right of any lines?
            on = false;
            
        for (let j = 0; j < 4; j++) { //Traverse edges
            let edge = tab[j],
                x0 = edge[0][0],
                x1 = edge[1][0],
                y0 = edge[0][1],
                y1 = edge[1][1],
                D = x1*(y-y0) - y1*(x-x0);

            if (Math.abs(D) < 0.0001) {
                on = true;
            }
            if (D < 0) {
                outside = true;
                break;
            }
        };

        if (!outside) {
            if (on) {
                return 0;
            }
            return -1;
        }
    };

    // If point isn't inside any tabs, return false
    return 1;
}

TurtleShepherd.prototype.isNearTab = function(x, y, atab) {
    let tabsOfInterest = [];

    if (atab) { tabsOfInterest.push([atab]) }
    else {tabsOfInterest = this.tabs};

    tabsOfInterest = this.tabs;

    for (let i = 0; i < tabsOfInterest.length; i++) {
        let tab = tabsOfInterest[i][0],
            outside = false, // Is point to the right of any lines?
            on = false;
            
        for (let j = 0; j < 4; j++) { //Traverse edges
            let edge = tab[j],
                x0 = edge[0][0],
                x1 = edge[1][0],
                y0 = edge[0][1],
                y1 = edge[1][1],
                D = x1*(y-y0) - y1*(x-x0);

            if (Math.abs(D) < 0.0001) {
                on = true;
            }
            if (D < 0) {
                outside = true;
                break;
            }
        };

        if (!outside) {
            if (on) {
                return 0;
            }
            return -1;
        }
    };

    // If point isn't inside any tabs, return false
    return 1;
}

TurtleShepherd.prototype.copyTabs = function(origTabs) {
    let tabs = origTabs;
    if (origTabs === undefined) {tabs = this.tabs};

    let tabsCopy = [];

    for (let i = 0; i < tabs.length; i++) {
        let tab = tabs[i][0],
            tabCopy = [];
            
        for (let j = 0; j < 4; j++) { //Transfer edges
            let edge = tab[j];

            tabCopy[j] = [ [edge[0][0], edge[0][1]], [edge[1][0], edge[1][1]] ];
        };

        tabsCopy.push([tabCopy]);
    };

    return tabsCopy;
}