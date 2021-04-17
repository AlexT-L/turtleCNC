/* Sprite */
// modified SpriteMorph turtleCNC functions


SpriteMorph.prototype.categories =
    [
        'motion',
        'control',
        'sensing',
        'operators',
        'variables',
        'lists',
        'other',
        'cnc',
    ];

SpriteMorph.prototype.blockColor = {
    motion : new Color(74, 108, 212),
    pen : new Color(0, 161, 120),
    looks : new Color(143, 86, 227),
    control : new Color(230, 168, 34),
    sensing : new Color(4, 148, 220),
    operators : new Color(98, 194, 19),
    variables : new Color(243, 118, 29),
    lists : new Color(217, 77, 17),
    other: new Color(150, 150, 150),
    cnc : new Color(207, 74, 217),
};


SpriteMorph.prototype.origInit = SpriteMorph.prototype.init;
SpriteMorph.prototype.init = function(globals) {
    this.origInit(globals);
    this.hide();
    this.lastJumped = false;
    this.turtle = null;
    this.isDown = true;
    this.cache = new Cache;
    this.color = StageMorph.prototype.defaultPenColor;
    this.stitchoptions = {};
};

SpriteMorph.prototype.addCutLine = function(x1, y1, x2, y2, angle=false ) {
  var stage = this.parentThatIsA(StageMorph);

  // Add cut to cache if on bottom
    let ts = stage.turtleShepherd,
        wp = ts.workpiece;

    if (wp) {
        if (ts.cutDepth >= wp.dimensions.H) {
            let l = Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1)),
                segs = this.cache.segments,
                s = 0;
            
            if (segs[0]) {
                s = segs[segs.length-1].s;
            }

            this.cache.segments.push({
                'x1':x1, 'y1':y1, 'x2':x2, 'y2':y2,
                'l':l, 's':s, 'angle':angle, 'type':'line'
            });
        }
    }

  if (this.cutLines === null) {
    this.cutLines = new THREE.Group();
  }
	color = new THREE.Color("rgb("+
    Math.round(this.color.r) + "," +
    Math.round(this.color.g) + "," +
    Math.round(this.color.b)  + ")" );
  opacity = this.color.a;

	var material = this.cache.findMaterial(color,opacity);
	if (!material) {
		material = new THREE.MeshBasicMaterial({
			color: color,
			side:THREE.DoubleSide,
			opacity: opacity
		});
		material.transparent = true;
		this.cache.addMaterial(material);
	}

	// render as line mesh
	/*
	if (false) {
		var geometry = this.cache.findGeometry('meshline', [x1,y1,x2,y2, color, this.color.a]);
		if (!geometry) {
			geometry = new THREE.Geometry();
			geometry.vertices = [
				new THREE.Vector3(x1, y1, 0.0),
				new THREE.Vector3(x2, y2, 0.0),
			];
			var g = new MeshLine();
			g.setGeometry( geometry );

			this.cache.addGeometry('meshline', g,  [x1,y1,x2,y2, color, this.color.a]);
		}

		var material = new MeshLineMaterial( {
				useMap: false,
				color: new THREE.Color( color ),
				opacity: this.color.a * 1,
				resolution: new THREE.Vector2( stage.width(), stage.height() ),
				sizeAttenuation: true,
				lineWidth: stage.penSize/200,
		});
		material.transparent = true;
		var mesh = new THREE.Mesh( g.geometry, material );
		stage.myCutLines.add(mesh);
	} */

	// render as plain lines - OLD version
	/*
	if (false) {

		var geometry = this.cache.findGeometry('stitch', [x1,y1,x2,y2]);
		if (!geometry) {
			geometry = new THREE.Geometry();
			geometry.vertices = [
				new THREE.Vector3(x1, y1, 0.0),
				new THREE.Vector3(x2, y2, 0.0),
			];
			this.cache.addGeometry('stitch', geometry, [x1,y1,x2,y2]);
		}
		line = new THREE.Line(geometry, material);
		stage.myCutLines.add(line);
	} */

	// render as quads
	if (true) {
		var geometry = new THREE.Geometry();
		var s = 2;

		let l = Math.sqrt((x2-x1) * (x2-x1) +(y2-y1) * (y2-y1)),
		    w = stage.penSize;

		l = Math.round((l + 0.00001) * 100) / 100;
		if (stage.penSize <= 1)
			l = l; //- s;

		var geometry = this.cache.findGeometry('plane', [l, w]);
		if (!geometry) {
			geometry = new THREE.PlaneGeometry( l, w, 1, 1);
			this.cache.addGeometry('plane', geometry, [l, w]);
		}

		line = new THREE.Mesh(geometry, material);
		line.translateX(x1 + (x2 - x1)/2);
		line.translateY(y1 + (y2 - y1)/2);
    //if (!angle) angle = this.heading;
		line.rotation.z = (90 - angle) * Math.PI / 180;
		stage.myCutLines.add(line);
	}
	this.reRender();
};



SpriteMorph.prototype.addJumpLine = function(x1, y1, x2, y2) {
    var stage = this.parentThatIsA(StageMorph);

    if (this.jumpLines === null) {
        this.jumpLines = new THREE.Group();
    }

	// just draw as basic lines - OLD Version
	if (false) {
		var material = new THREE.LineBasicMaterial( { color: 0xff0000 } );
		var geometry = new THREE.Geometry();
		geometry.vertices = [
			new THREE.Vector3(x1, y1, 0.0),
			new THREE.Vector3(x2, y2, 0.0),
		];
		line = new THREE.Line(geometry, material);
		stage.myJumpLines.add(line);
    }

	// draw as dashed smeshline
    if (true) {
		color = new THREE.Color("rgb(255,0,0)");
		var geometry = this.cache.findGeometry('meshline', [x1,y1,x2,y2, color, 0.8]);
		if (!geometry) {
			geometry = new THREE.Geometry();
			geometry.vertices = [
				new THREE.Vector3(x1, y1, 0.0),
				new THREE.Vector3(x2, y2, 0.0),
			];
			var g = new MeshLine();
			g.setGeometry( geometry );

			this.cache.addGeometry('meshline', g,  [x1,y1,x2,y2, color, this.color.a]);
		}

		var material = new MeshLineMaterial( {
				useMap: false,
				color: new THREE.Color( color ),
				opacity: 0.8,
				resolution: new THREE.Vector2( stage.width(), stage.height() ),
				sizeAttenuation: true,
				lineWidth: .003,
				dashArray: 0.06,    
				dashOffset: 0,
				dashRatio: 0.35
		});
		material.transparent = true;
		var mesh = new THREE.Mesh( g.geometry, material );
		mesh.visible = !StageMorph.prototype.hideJumps;
		stage.myJumpLines.add(mesh);
	}

    this.reRender();
};

// STITCH settings

SpriteMorph.prototype.origForward = SpriteMorph.prototype.forward;
SpriteMorph.prototype.forward = function (steps) {
    var dest,
        dist = steps; //* this.parent.scale || 0;
        stage = this.parentThatIsA(StageMorph);
        warn = false;

    oldx = this.xPosition();
    oldy = this.yPosition();

    if (dist >= 0) {
        dest = this.position().distanceAngle(dist, this.heading);
    } else {
        dest = this.position().distanceAngle(Math.abs(dist),  (this.heading - 180));
    }

    if (dist != 0) {
  		this.moveforward(steps);
    }
};

// New Movement
SpriteMorph.prototype.arcClockwise = function(r, dtheta) {
    this.moveArc(r, dtheta, true);
};

SpriteMorph.prototype.arcCounterClockwise = function(r, dtheta) {
    this.moveArc(r, dtheta, false);
}

SpriteMorph.prototype.forwardSegemensWithEndCheck = function(steps, stepsize) {
  
}

SpriteMorph.prototype.setSize = function(size) {
    let stage = this.parentThatIsA(StageMorph);
    if (!isNaN(size)) {
        this.size = Math.min(Math.max(+size, 0.0001), 1000);
    }
    stage.setPenSize(this.size);
    stage.turtleShepherd.setPenSize(this.size);
};

// CNC additions
//*****************************************

SpriteMorph.prototype.addTabHere = function(l, w) {
    let x = this.xPosition(),
        y = this.yPosition();
    this.addTab(x, y, 90-this.heading, l, w);
}

SpriteMorph.prototype.addTabLocation = function(x, y, angle) {
    this.addTab(x, y, angle);
}

SpriteMorph.prototype.addNumTabs = function(n) {
    let wp = this.parentThatIsA(StageMorph).turtleShepherd.workpiece;
        segments = this.cache.cutSegments,
        pathLength = segments[segments.length].s,
        numTabs = Math.max(Math.round(pathLength/delta)),
        ds = pathLength/numTabs,
        count = 0;

    if (!workpiece) {
        throw new Error("Cannot add tabs, no workpiece dimensions set");
    };


    for (let i = 0; i < segments.length; i++) {
        let sTarget = (count + 0.5)*ds,
            si = segments[i].s;

        if (sTarget < si) {
            if (segments[i].type == 'line') {
                let d = (sTarget - segments[Math.max(0, i-1)].l)/segments[i].l;
                    x = segments[i].x1 + d*(segments[i].x2 - segments[i].x1),
                    y = segments[i].y1 + (sTarget/segments[i].l)*(segments[i].y2 - segments[i].y1);

                this.addTab(x, y, segments[i].angle);
                count++;
            }

            if (segments[i].type == 'arc') {
                let xc = segments[i].xc, yc = segments[i].yc, r = segments[i].r,
                    theta1 = segments[i].theta1, theta2 = segments[i].theta2,
                    d = (sTarget - segments[Math.max(0, i-1)].l)/segments[i].l,
                    angle = theta1 + d*(theta2-theta1),
                    x = xc + r*Math.cos(angle),
                    y = yc + r*Math.sin(angle);

                this.addTab(x, y, angle);
                count++;
            }
        }
    }
}

SpriteMorph.prototype.addSpaceTabs = function(delta) {
    let segments = this.cache.cutSegments,
        pathLength = segments[segments.length].s,
        numTabs = Math.max(Math.round(pathLength/delta));
        
    this.addNumTabs(numTabs);
}

SpriteMorph.prototype.setTool = function(diameter, flutes){
    if (!isNaN(diameter)) {
        this.size = Math.min(Math.max(+diameter, 0.0001), 1000);
    }
	var stage = this.parentThatIsA(StageMorph);
    stage.setPenSize(this.size);
    stage.turtleShepherd.setTool(Math.abs(diameter), flutes);
}

SpriteMorph.prototype.getToolSize = function (){
	var stage = this.parentThatIsA(StageMorph);
    return stage.turtleShepherd.getToolSize();
}

SpriteMorph.prototype.clearCNC = function (){
	this.clear();
}

SpriteMorph.prototype.isCutting = function (){
	return this.isPenDown;
}

SpriteMorph.prototype.startCut = function (){
    var stage = this.parentThatIsA(StageMorph),
        ts = stage.turtleShepherd,
        wp = ts.workpiece;

    // clear cache if we are restarting cut
    if (!this.down() && wp) {
        if (ts.cutDepth >= wp.dimensions.H) 
            this.cache.clearSegments();
    };

	this.down();
    this.addStopPoint(this.xPosition(), this.yPosition());
    stage.turtleShepherd.startCut(this.xPosition(), this.yPosition());
}

SpriteMorph.prototype.endCut = function (){
	this.up();
    var stage = this.parentThatIsA(StageMorph);
    stage.turtleShepherd.stopCut();
}

SpriteMorph.prototype.setCutDepth = function (depth) {
    var stage = this.parentThatIsA(StageMorph);
    stage.turtleShepherd.setCutDepth(depth);
}

SpriteMorph.prototype.getSafeDepth = function () {
    var stage = this.parentThatIsA(StageMorph);
    return stage.turtleShepherd.getSafeDepth();
}

SpriteMorph.prototype.setSpindleSpeed = function (speed) {
    var stage = this.parentThatIsA(StageMorph);
    stage.turtleShepherd.setSpindleSpeed(speed);
}

SpriteMorph.prototype.setWorkpiece = function (material, x, y, z) {
    var stage = this.parentThatIsA(StageMorph);
    stage.turtleShepherd.setupWorkpiece(material, x, y, z);
}

SpriteMorph.prototype.chooseMachine = function (machine) {
    var stage = this.parentThatIsA(StageMorph);
    if (machine == "") {
        throw new Error("Please select a machine");
    }
    stage.turtleShepherd.setMachine(false, machine);
}

SpriteMorph.prototype.addMachine = function (name, x, y, z) {
    var stage = this.parentThatIsA(StageMorph);
    stage.turtleShepherd.setMachine(true, name, x, y, z);
}

SpriteMorph.prototype.addTab = function(x, y, angle=false, length, width ) {
    // Set dimensions automatically if not specified
    let l = this.penSize(),
        w = 0;

    if (length) {
        l = length;
    }
    if (width) {
        w = width;
    } else {
        w = l;
    }

  var stage = this.parentThatIsA(StageMorph);

  if (this.tabLines === null) {
    this.tabLines = new THREE.Group();
  }
	color = new THREE.Color("rgb(0,0,255)");
    opacity = 1;

	var material = this.cache.findMaterial(color,opacity);
	if (!material) {
		material = new THREE.MeshBasicMaterial({
			color: color,
			side:THREE.DoubleSide,
			opacity: opacity
		});
		material.transparent = true;
		this.cache.addMaterial(material);
	}


	// render as quads
	if (true) {
		var geometry = this.cache.findGeometry('plane', [l, w]);
		if (!geometry) {
			geometry = new THREE.PlaneGeometry( l, w, 1, 1);
			this.cache.addGeometry('plane', geometry, [l, w]);
		}

		line = new THREE.Mesh(geometry, material);
		line.translateX(x);
		line.translateY(y);
    //if (!angle) angle = this.heading;
		line.rotation.z = (angle) * Math.PI / 180;
		stage.myTabs.add(line);
	}
	this.reRender();

    // Add tab to TurtleShepherd
    stage.turtleShepherd.addTab(x, y, l, w, angle);
};

SpriteMorph.prototype.moveArc = function(r, dtheta, clockwise) {
    var stage = this.parentThatIsA(StageMorph);

    let x1 = this.xPosition(),
	    y1 = this.yPosition(),
        dxb, dyb;

    // calculate movement in body frame
    if (clockwise) {
        dxb = r*(Math.cos(radians(dtheta)) - 1);
        dyb = r*Math.sin(radians(dtheta));
    } else {
        dxb = dxb = r*(Math.cos(radians(-dtheta)) - 1);
        dyb = r*Math.sin(radians(-dtheta));
    }

    // Find dx2, dy2 and distance
    let theta1 = 90 - this.heading,
        dx2 = dxb*Math.cos(radians(theta1)) - dyb*Math.sin(radians(theta1)),
        dy2 = dyb*Math.cos(radians(theta1)) + dxb*Math.sin(radians(theta1)),
        dist = Math.sqrt(dx2**2 + dy2**2),
        chordHeading, newHeading;

    if (clockwise) { 
        chordHeading = 90 - (theta1 - dtheta/2);
        newHeading = 90 - (theta1 - dtheta);
    } else { 
        chordHeading = 90 - (theta1 + dtheta/2);
        newHeading = 90 - (theta1 + dtheta);
    };


    // Move sprite & turtle and register cut
	if (dtheta >= 0) {
		dest = this.position().distanceAngle(dist, chordHeading);
	} else {
		dest = this.position().distanceAngle(Math.abs(dist),  (chordHeading - 180));
	}

    if (dtheta != 0) {
		this.setPosition(dest);
        this.setHeading(newHeading);

        let theta1c = clockwise ? theta1+90 : theta1-90,
            theta2c = clockwise ? theta1c-dtheta : theta1c+dtheta;
	    warn = stage.turtleShepherd.arcTo(x1, y1, r, theta1c, theta2c, clockwise, this.isDown );

	    if (this.isDown) {
		    this.addArcCut(x1, y1, theta1, r, dtheta, clockwise);
            this.addStopPoint(this.xPosition(), this.yPosition());
	    } else {
		    this.addJumpArc(x1, y1, theta1, r, dtheta, clockwise);
	    }
	    stage.moveTurtle(this.xPosition(), this.yPosition());
    }
}

SpriteMorph.prototype.addArcCut = function(x1, y1, theta1, r, dtheta, clockwise) {
    var stage = this.parentThatIsA(StageMorph);
    
    // Find theta1 and center
    let theta2 = theta1 + dtheta,
        theta1Rad = theta1 * Math.PI/180,
        theta2Rad = theta2 * Math.PI/180,
        dthetaRad = dtheta * Math.PI/180,
        t = this.penSize()/2; // thickness of arc

    // Geometry of cut
    let geometry = this.cache.findGeometry('arc', [r-t, r+t, Math.round(dthetaRad*r), 1, 0, dthetaRad,]),
        debugcoloring = true;
	if (!geometry) {
		geometry = new THREE.RingGeometry( r-t, r+t, Math.round(dthetaRad*r), 1, 0, dthetaRad );
		this.cache.addGeometry('arc', geometry, [r-t, r+t, Math.round(dthetaRad*r), 1, 0, dthetaRad,]);
	};
    
    // Color
    let arcColor = new THREE.Color("rgb("+
                    Math.round(this.color.r) + "," +
                    Math.round(this.color.g) + "," +
                    Math.round(this.color.b)  + ")" 
                    ),
        arcOpacity = this.color.a;
    
	let material = this.cache.findMaterial( arcColor, arcOpacity);
	if (!material) {
		material = new THREE.MeshBasicMaterial( { color: arcColor, opacity: arcOpacity} );
		this.cache.addMaterial(material);
	}

    //if (debugcoloring) {material = this.cache.findMaterial( 0xff0000, 1);}

    // Create arc and put into position
    let arc = new THREE.Mesh( geometry, material );
    // Turn Clockwise or Counterclockwise based on input
    if (clockwise) {
        let angle2 = theta1Rad + Math.PI/2,
            angle1 = angle2-dthetaRad,
            x = x1 - r*Math.cos(angle2),
            y = y1 - r*Math.sin(angle2),
            xb = x*Math.cos(angle1) + y*Math.sin(angle1),
            yb = y*Math.cos(angle1) - x*Math.sin(angle1);
        arc.rotateZ(angle1);
        arc.translateX(xb);
        arc.translateY(yb);
    } else { // counter clockwise
        let angle = theta1Rad-Math.PI/2,
            x = x1 - r*Math.cos(angle),
            y = y1 - r*Math.sin(angle),
            xb = x*Math.cos(angle) + y*Math.sin(angle),
            yb = y*Math.cos(angle) - x*Math.sin(angle);
        arc.rotateZ(angle);
        arc.translateX(xb);
        arc.translateY(yb);
    };

    // Add to scene
    stage.myArcCuts.add(arc);
    this.reRender();
};

SpriteMorph.prototype.addJumpArc = function(x1, y1, theta1, r, dtheta, clockwise) {
    var stage = this.parentThatIsA(StageMorph);

    // Draw as simple 2D curve
    if (false) {
        let geometry = this.cache.findGeometry('jumpArc', [x1, x2, r, theta1, theta1 + dtheta, clockwise,]);
	    if (!geometry) {
		    let curve = new THREE.ArcCurve(
                    0, 0,             // ax, aY
                    r,                  // aRadius
                    0, radians(dtheta), // aStartAngle, aEndAngle
                    false             // aClockwise
                    ),
                points = curve.getSpacedPoints( 20 ),
                path = new THREE.Path();

            geometry = path.createGeometry( points );
		    this.cache.addGeometry('jumpArc', geometry, [r, dtheta, clockwise,]);
	    }

        let material = new THREE.LineBasicMaterial( { color : 0xff0000 } ),
            arc = new THREE.Line( geometry, material );
    };


    // draw as dashed smeshline
    if (true) {
		color = new THREE.Color("rgb(255,0,0)");
		//var geometry = this.cache.findGeometry('jumpArc', [x1,y1,x2,y2, color, 0.8]);
		//if (!geometry) {
			let curve = new THREE.ArcCurve(
                    0, 0,             // ax, aY
                    r,                  // aRadius
                    0, radians(dtheta), // aStartAngle, aEndAngle
                    false             // aClockwise
                    ),
                //segments = Math.min(90,  Math.max(1, Math.round((dtheta % 360)/4))  ),
                points = curve.getSpacedPoints( 20 ),
                path = new THREE.Path();

            geometry = path.createGeometry( points );
			var g = new MeshLine();
			g.setGeometry( geometry );

			//this.cache.addGeometry('jumpArc', g,  [x1,y1,x2,y2, color, this.color.a]);
		//}

		var material = new MeshLineMaterial( {
				useMap: false,
				color: new THREE.Color( color ),
				opacity: 0.8,
				resolution: new THREE.Vector2( stage.width(), stage.height() ),
				sizeAttenuation: true,
				lineWidth: .003,
				dashArray: 0.06,
				dashOffset: 0,
				dashRatio: 0.35
		});
		material.transparent = true;
		var arc = new THREE.Mesh( g.geometry, material );
		//stage.myJumpLines.add(mesh);
    }


    // move arc into position
    // Turn Clockwise or Counterclockwise based on input
    if (clockwise) {
        let angle2 = radians(theta1 + 90),
            angle1 = angle2 - radians(dtheta),
            x = x1 - r*Math.cos(angle2),
            y = y1 - r*Math.sin(angle2),
            xb = x*Math.cos(angle1) + y*Math.sin(angle1),
            yb = y*Math.cos(angle1) - x*Math.sin(angle1);
        arc.rotateZ(angle1);
        arc.translateX(xb);
        arc.translateY(yb);
    } else { // counter clockwise
        let angle = radians(theta1 - 90),
            x = x1 - r*Math.cos(angle),
            y = y1 - r*Math.sin(angle),
            xb = x*Math.cos(angle) + y*Math.sin(angle),
            yb = y*Math.cos(angle) - x*Math.sin(angle);
        arc.rotateZ(angle);
        arc.translateX(xb);
        arc.translateY(yb);
    };

    // Add to scene
    stage.myJumpArcs.add(arc);
    this.reRender();
};

SpriteMorph.prototype.addStopPoint = function() {
    var stage = this.parentThatIsA(StageMorph),
        r = this.penSize()/2;
        s = Math.max(r,50);

	var geometry = this.cache.findGeometry('circle', [ r, s,]);
	if (!geometry) {
		geometry = new THREE.CircleGeometry( r, s );
		geometry.vertices.shift();
		this.cache.addGeometry('circle', geometry, [r, s,]);
	}

	let pColor = new THREE.Color("rgb("+
                    Math.round(this.color.r) + "," +
                    Math.round(this.color.g) + "," +
                    Math.round(this.color.b)  + ")" 
                    ),
        pOpacity = this.color.a;

    let material = this.cache.findMaterial( pColor, pOpacity);
	if (!material) {
		material = new THREE.MeshBasicMaterial( { color: arcColor, opacity: arcOpacity} );
		this.cache.addMaterial(material);
	}

    var circle = new THREE.Mesh( geometry, material );
    circle.translateX(this.xPosition());
    circle.translateY(this.yPosition());
    stage.myStopPoints.add(circle);
    this.reRender();
};

//**********************************************************

SpriteMorph.prototype.moveforward = function (steps) {
	var dest,
		dist = steps * this.parent.scale || 0;
		stage = this.parentThatIsA(StageMorph);
		warn = false;

	oldx = this.xPosition();
	oldy = this.yPosition();

	if (dist >= 0) {
		dest = this.position().distanceAngle(dist, this.heading);
	} else {
		dest = this.position().distanceAngle(Math.abs(dist),  (this.heading - 180));
	}

	if (dist != 0) {
		this.setPosition(dest);

	    warn = stage.turtleShepherd.moveTo(
		    oldx, oldy,
		    this.xPosition(), this.yPosition(),
		    this.isDown );

	    if (this.isDown) {
		    this.addCutLine(oldx, oldy, this.xPosition(), this.yPosition(), this.heading);
            this.addStopPoint();
	    } else {
		    this.addJumpLine(oldx, oldy, this.xPosition(), this.yPosition());
	    }
	    stage.moveTurtle(this.xPosition(), this.yPosition());
    }
}

SpriteMorph.prototype.origGotoXY = SpriteMorph.prototype.gotoXY;
SpriteMorph.prototype.gotoXY = function (x, y, justMe, noShadow) {
    var stage = this.parentThatIsA(StageMorph);
    var dest;
    var oldx = this.xPosition();
    var oldy = this.yPosition();
    var oldheading = this.heading;
    var warn = false;

    if (!stage) {return; }

    x = !isFinite(+x) ? 0 : +x;
    y = !isFinite(+y) ? 0 : +y;

    var dest = new Point(x, y).subtract(new Point(this.xPosition(), this.yPosition()));
    var a = (x - this.xPosition());
    var b = (y - this.yPosition());
    var dist = Math.sqrt(a*a + b*b);
    if (a == 0 && b == 0) dist = 0;

    var deltaX = (x - this.xPosition()) * this.parent.scale;
    var deltaY = (y - this.yPosition()) * this.parent.scale;
    var angle = Math.abs(deltaX) < 0.0001 ? (deltaY < 0 ? 90 : 270)
          : Math.round( (deltaX >= 0 ? 0 : 180)  - (Math.atan(deltaY / deltaX) * 57.2957795131),8
        );
    angle = angle + 90;

    if ( Math.round(dist,5) <= 0.0001) {
		  // jump in place - don't add / ignore
		  //console.log("jump in place - don't add / ignore",  this.isDown,this.xPosition(), this.yPosition(), dist);
    } else {

        this.origGotoXY(x,y);
        
        // dont' cut if is zero value length
        // - shoud we filter out all noShadows?
        // if (!noShadow && dist > 1) {
        if (dist != 0) {
        warn = this.parentThatIsA(StageMorph).turtleShepherd.moveTo(
            oldx, oldy,
            this.xPosition(), this.yPosition(),
            this.isDown );
        }
        
        if (this.isDown) {
	        this.addCutLine(oldx, oldy, this.xPosition(), this.yPosition(), angle);
        } else {
            this.addJumpLine(oldx, oldy, this.xPosition(), this.yPosition());
        }
        
        stage.moveTurtle(this.xPosition(), this.yPosition());
		this.setHeading(oldheading);
	}
};

/*
SpriteMorph.prototype.gotoXYBy = function (x, y, stepsize) {
  // this block is deprecated but keep it for compatibility
  stitchLength = this.stitchoptions.length;
  runState = this.isRunning;
  this.isRunning = true;
  this.stitchoptions.length = stepsize;
  this.gotoXY(x,y);
  this.stitchoptions.length = stitchLength;
  this.isRunning = runState;
};*/


SpriteMorph.prototype.gotoXYIn = function (x, y, steps) {
    var stage = this.parentThatIsA(StageMorph);
    var dest;

    if (!stage) {return; }

    x = !isFinite(+x) ? 0 : +x;
    y = !isFinite(+y) ? 0 : +y;

    var dest = new Point(x, y).subtract(
                  new Point(this.xPosition(), this.yPosition()));

    var a = (x - this.xPosition());
    var b = (y - this.yPosition());
    var dist = Math.sqrt(a*a + b*b);
    if (a == 0 && b == 0)
      dist = 0;

	var deltaX = (x - this.xPosition()) * this.parent.scale;
	var deltaY = (y - this.yPosition()) * this.parent.scale;
	var angle = Math.abs(deltaX) < 0.001 ? (deltaY < 0 ? 90 : 270)
			  : Math.round(
			  (deltaX >= 0 ? 0 : 180)
				  - (Math.atan(deltaY / deltaX) * 57.2957795131)
		  );
	this.setHeading(angle + 90);
};


SpriteMorph.prototype.pointTowards = function (x, y) {
    var stage = this.parentThatIsA(StageMorph);
    var dest;

    if (!stage) {return; }

    x = !isFinite(+x) ? 0 : +x;
    y = !isFinite(+y) ? 0 : +y;


	var deltaX = (x - this.xPosition()) * this.parent.scale;
	var deltaY = (y - this.yPosition()) * this.parent.scale;
	var angle = Math.abs(deltaX) < 0.001 ? (deltaY < 0 ? 90 : 270)
			  : Math.round(
			  (deltaX >= 0 ? 0 : 180)
				  - (Math.atan(deltaY / deltaX) * 57.2957795131)
	);
	this.setHeading(angle + 90);
};

SpriteMorph.prototype.drawText = function (text, size) {
  size = Math.max(21, size);
  return this.drawTextScale(text, size/21.0, false);
}

SpriteMorph.prototype.drawTextDev = function (text, size, trim) {
  size = Math.max(21, size);
  return this.drawTextScale(text, size/21.0, trim);
}

SpriteMorph.prototype.drawTextScale = function (text, scale, trim) {
    var stage = this.parentThatIsA(StageMorph);
    var dest;
    var myself = this;
    
    if (!stage) {return; }

	function doAJump(x, y) {
		var penState = myself.isDown;
		myself.isDown = false;
        if (trim) {
          myself.gotoXY(x+2, y+2);
          myself.gotoXY(x-2, y-2);
          myself.gotoXY(x, y);
        } else {
            myself.gotoXY(x, y);
        }

		//lf.gotoXY(x+2, y+2);
		//myself.gotoXY(x, y);
		myself.isDown = penState;
	}

	if (stage.fonts) {
        heading = this.heading;
        vx = Math.cos(radians(this.heading - 90));
        vy = Math.sin(radians(this.heading - 90));
        nx = Math.cos(radians(this.heading ));
        ny = Math.sin(radians(this.heading ));
    
        if (!isNaN(text)) {
          text = text.toString()
        }
    
		for(var i in text) {
			var index = text.charCodeAt(i) - 33;
			var x = this.xPosition();
			var y = this.yPosition();
			var maxx = 0, maxy = 0;
			var nextIsPenUp = false;

			if (stage.fonts[text[i]]){
				if (true)
                    coords = stage.fonts[text[i]]["cut"];
                else {
                    lines = stage.fonts[text[i]]["orig"];
                    coords = [];
                    for (var j=0; j<lines.length; j++) {
                        coords.push("jump");
                        for (var k=0; k<lines[j].length; k++) {
                            coords.push(lines[j][k])
                            if (k==0)
                            coords.push("move");
                        }
                    }
                }

				for (var j=0; j<coords.length; j++) {
				    if (coords[j] == "jump") {
						nextIsPenUp = true;
                        nextIsStitch = false;
					} else if (coords[j] == "move") {
						nextIsStitch = false;
                        nextIsPenUp = false;
                    } else if (coords[j] == "stitch") {
						nextIsStitch = true;
                        nextIsPenUp = false;
					} else {
                        maxx = Math.max(maxx, coords[j][0]);
                        dx = coords[j][0] * scale * vx - coords[j][1] * scale * vy;
                        dy = coords[j][1] * scale * ny - coords[j][0] * scale * nx;
						if (nextIsPenUp || j == 0  ) {
							doAJump(x + dx, y - dy)
						} else if (nextIsStitch)	{
						    this.gotoXY(x + dx, y - dy)
						} else {
                            this.gotoXY(x + dx, y - dy);
                        }
					}
				}

                if (i == text.length - 1) {
                    dx = (maxx) * scale * vx;
                    dy = 0 - (maxx) * scale * nx;
                } else {
                    dx = (maxx+5) * scale * vx;
                    dy = 0 - (maxx+5) * scale * nx;
                }

                doAJump(x + dx, y - dy);


			} else {
                dx = 10 * scale * vx;
                dy = 0 - 10 * scale * nx;
				doAJump(x + dx, y - dy);
			}
        }
    this.setHeading(heading);

    } else {
		console.log("no fonts loaded");
	}
};


SpriteMorph.prototype.getTextLength = function (text, size) {

  scale = size/21.0;

  var stage = this.parentThatIsA(StageMorph);
  var dest;
  var myself = this;

  if (!stage) {return; }


	if (stage.fonts) {
    var x = 0;

		for(var i in text) {
			var index = text.charCodeAt(i) - 33;
			var maxx = 0, maxy = 0;
      var charwidth = 0;

			if (stage.fonts[text[i]]){
        if (true)
          coords = stage.fonts[text[i]]["stitch"];
        else {
          lines = stage.fonts[text[i]]["orig"];
          coords = [];
          for (var j=0; j<lines.length; j++) {
            coords.push("jump");
            for (var k=0; k<lines[j].length; k++) {
              coords.push(lines[j][k])
              if (k==0)
                coords.push("move");
            }
          }
        }

				for (var j=0; j<coords.length; j++) {
          if (coords[j] != "jump" && coords[j] != "move" && coords[j] != "stitch") {
            maxx = Math.max(maxx, coords[j][0]);
          }
				}
        x = x + maxx * scale;
        if (i < text.length - 1)
          x = x + 5 * scale;
			} else {
        x = x + 10 * scale;
			}
	  }
    return x;
  } else {
		return 0;
	}
};


SpriteMorph.prototype.origSetHeading = SpriteMorph.prototype.setHeading;
SpriteMorph.prototype.setHeading = function (degrees) {
    var stage = this.parentThatIsA(StageMorph);
    this.origSetHeading(degrees);
    stage.rotateTurtle(this.heading);
};


// COLORS
// ####################################################################

SpriteMorph.prototype.setColor = function (aColor) {
    var stage = this.parentThatIsA(StageMorph);
    this.color = aColor;
    stage.turtle.material.color = new THREE.Color("rgb("+this.color.r + "," + this.color.g + "," + this.color.b + ")");
    this.reRender();
};


SpriteMorph.prototype.setColorRGB = function (r,g,b) {
	var a = this.color.a;
	r = Math.max(Math.min(r, 255), 0);
	b = Math.max(Math.min(b, 255), 0);
	g = Math.max(Math.min(g, 255), 0);
    this.setColor(new Color(r, g, b, a));
};

SpriteMorph.prototype.setColorHSV = function (h, s, v) {
	var col = new Color();
	h = Math.max(Math.min(h, 1), 0);
	s = Math.max(Math.min(s, 1), 0);
	v = Math.max(Math.min(v, 1), 0);
	col.set_hsv(h, s, v);
	col.a = this.color.a;
	this.setColor(col);
}

SpriteMorph.prototype.pickHue = function (value) {
    this.setColor(value);
};

SpriteMorph.prototype.getHue = function () {
    return this.color.hsv()[0] * 360;
};

SpriteMorph.prototype.setHue = function (num) {
    var hsv = this.color.hsv(),
        n = +num;
    if (n < 0 || n > 360) { // wrap the hue
        n = (n < 0 ? 360 : 0) + n % 360;
    }
    hsv[0] = n / 360;
    this.setColorHSV(hsv[0],hsv[1],hsv[2]);
};

SpriteMorph.prototype.changeHue = function (delta) {
    this.setHue(this.getHue() + (+delta || 0));
};

SpriteMorph.prototype.getBrightness = function () {
    return this.color.hsv()[2] * 100;
};

SpriteMorph.prototype.setBrightness = function (num) {
    var hsv = this.color.hsv();
    hsv[2] = Math.max(Math.min(+num || 0, 100), 0) / 100; // shade doesn't wrap
    this.setColorHSV(hsv[0],hsv[1],hsv[2]);

};

SpriteMorph.prototype.changeBrightness = function (delta) {
    this.setBrightness(this.getBrightness() + (+delta || 0));
};

SpriteMorph.prototype.setSaturation = function (num) {
    var hsv = this.color.hsv();
    hsv[1] = Math.max(Math.min(+num || 0, 100), 0) / 100; // shade doesn't wrap
    this.setColorHSV(hsv[0],hsv[1],hsv[2]);
};

SpriteMorph.prototype.getSaturation = function () {
    return this.color.hsv()[1] * 100;
};

SpriteMorph.prototype.changeSaturation= function (delta) {
    this.setSaturation(this.getSaturation() + (+delta || 0));
};

SpriteMorph.prototype.setHSB = function (channel, value) {
	// Hue is cyclic, while saturation, brightness and opacity are clipped between 0 and 100
    if (channel == 'hue') {
        this.setHue(Math.abs(value + 360) % 360);
    } else if (channel == 'saturation') {
        this.setSaturation(Math.max(Math.min(value, 100), 0));
    } else if (channel == 'brightness') {
        this.setBrightness(Math.max(Math.min(value, 100), 0));
	}
};

SpriteMorph.prototype.getHSB = function (channel, value) {
    if (channel == 'hue') {
        return this.getHue();
    }
    if (channel == 'saturation') {
        return this.getSaturation();
    }
    if (channel == 'brightness') {
       return this.getBrightness();
    }
};

SpriteMorph.prototype.changeHSB = function (channel, value) {
    if (channel == 'hue') {
        return this.changeHue(value);
    } else if (channel == 'saturation') {
       return this.changeSaturation(value);
    } else if (channel == 'brightness') {
        return this.changeBrightnes(value);
    }
};

SpriteMorph.prototype.setOpacity = function (value) {
	value = Math.max(Math.min(value, 100), 0);
	this.color.a = value / 100;
    this.setColor(this.color);
};

SpriteMorph.prototype.getOpacity = function (value) {
	return this.color.a * 100;
};

SpriteMorph.prototype.changeOpacity= function (delta) {
    this.setOpacity(this.getOpacity() + (+delta || 0));
};

SpriteMorph.prototype.setColorHex = function (hex) {
	var a = this.color.a;
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;

	hex = hex.replace(shorthandRegex, function(m, r, g, b) {
		return r + r + g + g + b + b;
	});

	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (result) {
		r = parseInt(result[1], 16);
		g = parseInt(result[2], 16);
		b = parseInt(result[3], 16);
		this.setColor(new Color(r, g, b, a));
	} else {
	  // silently ignore
	}
};

SpriteMorph.prototype.getColorRGB = function (){
	return new List([this.color.r, this.color.g, this.color.b]);
}

SpriteMorph.prototype.getColorHex = function (){
	return new String("#" + ((1 << 24) + (Math.round(this.color.r) << 16) + (Math.round(this.color.g) << 8)
	+ Math.round(this.color.b)).toString(16).slice(1));
}

SpriteMorph.prototype.getColorHSV = function (){
	return new List(this.color.hsv());
}


// PEN UP DOWN
/*
SpriteMorph.prototype.isPenDown = function (){
	return this.isDown;
}

SpriteMorph.prototype.getPenSize = function (){
	return this.penSize();
}

SpriteMorph.prototype.setSize = function (size) {
    var stage = this.parentThatIsA(StageMorph);
    if (!isNaN(size)) {
        this.size = Math.min(Math.max(+size, 0.0001), 1000);
    }
    stage.setPenSize(this.size);
    stage.turtleShepherd.setPenSize(this.size);
};
*/

SpriteMorph.prototype.drawLine = function (start, dest) {};

SpriteMorph.prototype.origSilentGotoXY = SpriteMorph.prototype.silentGotoXY;
SpriteMorph.prototype.silentGotoXY = function (x, y, justMe) {
    this.origSilentGotoXY(x,y,justMe);
};

SpriteMorph.prototype.origClear = SpriteMorph.prototype.clear;
SpriteMorph.prototype.clear = function () {
    this.origClear();
    this.parentThatIsA(StageMorph).clearAll();
    this.parentThatIsA(StageMorph).turtleShepherd.clear();
    this.parentThatIsA(StageMorph).renderer.changed = true  ;
};

SpriteMorph.prototype.reRender = function () {
    this.parentThatIsA(StageMorph).renderer.changed = true  ;
    //this.hide();
    this.changed();
};

// Single Sprite mode

SpriteMorph.prototype.origDrawNew = SpriteMorph.prototype.drawNew;
SpriteMorph.prototype.drawNew = function () {
    this.origDrawNew();
};


SpriteMorph.prototype.wait = function(millis)
{
    var date = new Date();
    var curDate = null;
    do { curDate = new Date(); }
    while(curDate-date < millis);
}


//SpriteMorph.prototype.thumbnail = function (extentPoint) {};
//SpriteMorph.prototype.drawNew = function () { this.hide() }

// THREE additions

THREE.Object3D.prototype.addLineToPointWithColor = function (point, color, thickness) {
    return this.addLineFromPointToPointWithColor(new THREE.Vector3(), point, color, thickness)
};

THREE.Object3D.prototype.addLineFromPointToPointWithColor = function (originPoint, destinationPoint, color, thickness) {
    geometry = new THREE.Geometry();
    geometry.vertices.push(originPoint);
    geometry.vertices.push(destinationPoint);
    var lineMaterial = new THREE.LineBasicMaterial({ color: color, linewidth: (thickness ? thickness : 1) });
    var line = new THREE.Line(geometry, lineMaterial);
    this.add(line);
    return line;
};

SpriteMorph.prototype.resetAll = function () {
	var myself = this;
	myself.setColor(StageMorph.prototype.defaultPenColor);
	myself.parentThatIsA(StageMorph).setPenSize(1);
	myself.gotoXY(0,0);
	myself.setHeading(90);
	myself.clear();
	myself.isDown = true;
}

// Block specs

SpriteMorph.prototype.originalInitBlocks = SpriteMorph.prototype.initBlocks;
SpriteMorph.prototype.initBlocks = function () {

    var myself = this;
    this.originalInitBlocks();

    this.blocks.reportProxiedURL = {
		type: 'reporter',
        spec: 'proxied URL %s',
        category: 'sensing',
        defaults: ["snap.berkley.edu"]
	}

	// sprite movements

    this.blocks.resetAll =
    {
		only: SpriteMorph,
        type: 'command',
        spec: 'reset',
        category: 'control'
    };
    this.blocks.pointTowards =
    {
		only: SpriteMorph,
        type: 'command',
        category: 'motion',
        spec: 'point towards x: %n y: %n',
        defaults: [0, 0]
    };
    this.blocks.drawTextScale =
    {
		    only: SpriteMorph,
        type: 'command',
        category: 'motion',
        spec: 'draw text: %s scale: %n',
        defaults: ["hello", 2]
    };
    this.blocks.drawText =
    {
		    only: SpriteMorph,
        type: 'command',
        category: 'motion',
        spec: 'draw text %s with size %n',
        defaults: ["hello", 21]
    };
    this.blocks.drawTextDev =
    {
		    only: SpriteMorph,
        type: 'command',
        category: 'motion',
        spec: 'draw text %s with size %n trim %b',
        defaults: ["hello", 2, true]
    };
    this.blocks.getTextLength =
    {
		    only: SpriteMorph,
        type: 'reporter',
        category: 'motion',
        spec: 'text length of %s with size %n',
        defaults: ["hello", 21]
    };
    // Movement additions
    this.blocks.arcClockwise = 
    {
        only: SpriteMorph,
        type: 'command',
        category: 'motion',
        spec: '%clockwise arc radius %n angle %n',
        defaults: [0, 0]
    };
    this.blocks.arcCounterClockwise = 
    {
        only: SpriteMorph,
        type: 'command',
        category: 'motion',
        spec: '%counterclockwise arc radius %n angle %n',
        defaults: [0, 0]
    }

    // pen blocks

    this.blocks.isPenDown =
    {
		only: SpriteMorph,
        type: 'predicate',
        category: 'pen',
        spec: 'pen down?',
    };

    this.blocks.getPenSize  =
    {
		only: SpriteMorph,
        type: 'reporter',
        category: 'pen',
        spec: 'pen size',
    };

	// pen color blocks

	this.blocks.setColor = {
		only: SpriteMorph,
		type: 'command',
		category: 'colors',
		spec: 'set color to %clr'
	};

    this.blocks.setColorRGB =
    {
		only: SpriteMorph,
        type: 'command',
        category: 'colors',
        spec: 'set color to RGB %n %n %n',
        defaults: [0, 255, 0]
    };

    this.blocks.setColorHex =
    {
		only: SpriteMorph,
        type: 'command',
        category: 'colors',
        spec: 'set color to hex %s',
        defaults: ['#ff0000']
    };

    this.blocks.setColorHSV =
    {
		only: SpriteMorph,
        type: 'command',
        category: 'colors',
        spec: 'set color to HSV %n %n %n',
        defaults: [0.3, 0.7, 0.6]
    };

    this.blocks.setOpacity =
    {
		only: SpriteMorph,
        type: 'command',
        category: 'pen',
        spec: 'set opacity to %n',
        defaults: [100]
    };

    this.blocks.changeOpacity =
    {
		only: SpriteMorph,
        type: 'command',
        category: 'pen',
        spec: 'change opacity by %n',
        defaults: [10]
    };

    this.blocks.getOpacity =
    {
		only: SpriteMorph,
        type: 'reporter',
        category: 'pen',
        spec: 'opacity',
    };

	this.blocks.getColorRGB =
    {
		only: SpriteMorph,
        type: 'reporter',
        category: 'colors',
        spec: 'RGB color',
    };

	this.blocks.getColorHSV =
    {
		only: SpriteMorph,
        type: 'reporter',
        category: 'colors',
        spec: 'HSV color',
    };

	this.blocks.getColorHex =
    {
		only: SpriteMorph,
        type: 'reporter',
        category: 'colors',
        spec: 'hex color',
    };

	// color
    this.blocks.pickHue =
    {
		only: SpriteMorph,
        type: 'command',
        spec: 'set color by hue %huewheel',
        category: 'colors'
    };
    this.blocks.setHSB =
    {
		only: SpriteMorph,
        type: 'command',
        spec: 'set %hsb to %n',
        category: 'colors',
        defaults: ['hue', 50]
    };
    this.blocks.changeHSB =
    {
		only: SpriteMorph,
        type: 'command',
        spec: 'change %hsb by %n',
        category: 'colors',
        defaults: ['hue', 10]
    };
    this.blocks.getHSB =
    {
		only: SpriteMorph,
        type: 'reporter',
        spec: 'color: %hsb',
        category: 'colors'
    };
    
    // CNC blocks
    
    this.blocks.clearCNC = 
    {
    	only: SpriteMorph,
        type: 'command',
        category: 'cnc',
        spec: 'clear',
    };
    
    this.blocks.setTool = 
    {
        only: SpriteMorph,
        type: 'command',
        spec: 'set tool: Diameter %n Cutting edges %n',
        category: 'cnc',
        defaults: [5, 1]
    };
    
    this.blocks.getToolSize = 
    {
        only: SpriteMorph,
        type: 'reporter',
        spec: 'tool size',
        category: 'cnc'
    };
    
    this.blocks.setSpindleSpeed = 
    {
        only: SpriteMorph,
        type: 'command',
        spec: 'set spindle speed to %n rpm',
        category: 'cnc',
        defaults: [10000]
    };

    this.blocks.setCutDepth = 
    {
        only: SpriteMorph,
        type: 'command',
        spec: 'set cut depth to %n',
        category: 'cnc',
        defaults: [0]
    };
    
    this.blocks.getSafeDepth = 
    {
        only: SpriteMorph,
        type: 'reporter',
        spec: 'safe cut depth',
        category: 'cnc'
    };
    
    this.blocks.isCutting =
    {
		only: SpriteMorph,
        type: 'predicate',
        category: 'cnc',
        spec: 'cutting mode?',
    };
    
    this.blocks.startCut = 
    {
    	only: SpriteMorph,
        type: 'command',
        category: 'cnc',
        spec: 'start cut',
    };
    
    this.blocks.endCut = 
    {
    	only: SpriteMorph,
        type: 'command',
        category: 'cnc',
        spec: 'stop cut',
    };

    this.blocks.setWorkpiece = 
    {
        only: SpriteMorph,
        type: 'command',
        category: 'cnc',
        spec: 'workpiece: %material L %n W %n H %n',
        defaults: ['Aluminum', 0, 0, 0]
    };
    
    this.blocks.chooseMachine = 
    {
        only: SpriteMorph,
        type: 'command',
        category: 'cnc',
        spec: 'set machine to %machine'
    };
    
    this.blocks.addMachine = 
    {
        only: SpriteMorph,
        type: 'command',
        category: 'cnc',
        spec: 'add machine: %s L %n W %n H %n',
        defaults: [localize('Name'), 0, 0, 0]
    };
    
    this.blocks.addTabHere = {
            type: 'command',
            category: 'cnc',
            spec: 'add tab here l %n w %n',
            defaults: [0,0]
    };

    this.blocks.addTabLocation = {
            type: 'command',
            category: 'cnc',
            spec: 'add tab at x %n y %n heading %n',
            defaults: [0,0,0]
    };

	// more blocks

    this.blocks.zoomToFit =
    {
        type: 'command',
        spec: 'zoom to fit',
        category: 'other'
    };
    
  	this.blocks.reportPi = {
  		type: 'reporter',
  		category: 'operators',
  		spec: 'PI',
  	};
    
};

SpriteMorph.prototype.initBlocks();

// SpriteMorph block templates

SpriteMorph.prototype.blockTemplates = function (category) {
    var blocks = [], myself = this, varNames, button,
        cat = category || 'motion', txt,
        inheritedVars = this.inheritedVariableNames();

    function block(selector) {
        if (StageMorph.prototype.hiddenPrimitives[selector]) {
            return null;
        }
        var newBlock = SpriteMorph.prototype.blockForSelector(selector, true);
        newBlock.isTemplate = true;
        return newBlock;
    }

    function variableBlock(varName) {
        var newBlock = SpriteMorph.prototype.variableBlock(varName);
        newBlock.isDraggable = false;
        newBlock.isTemplate = true;
        if (contains(inheritedVars, varName)) {
            newBlock.ghost();
        }
        return newBlock;
    }

    function watcherToggle(selector) {
        if (StageMorph.prototype.hiddenPrimitives[selector]) {
            return null;
        }
        var info = SpriteMorph.prototype.blocks[selector];
        return new ToggleMorph(
            'checkbox',
            this,
            function () {
                myself.toggleWatcher(
                    selector,
                    localize(info.spec),
                    myself.blockColor[info.category]
                );
            },
            null,
            function () {
                return myself.showingWatcher(selector);
            },
            null
        );
    }

    function variableWatcherToggle(varName) {
        return new ToggleMorph(
            'checkbox',
            this,
            function () {
                myself.toggleVariableWatcher(varName);
            },
            null,
            function () {
                return myself.showingVariableWatcher(varName);
            },
            null
        );
    }

    function helpMenu() {
        var menu = new MenuMorph(this);
        menu.addItem('help...', 'showHelp');
        return menu;
    }

    function addVar(pair) {
        var ide;
        if (pair) {
            if (myself.isVariableNameInUse(pair[0], pair[1])) {
                myself.inform('that name is already in use');
            } else {
                ide = myself.parentThatIsA(IDE_Morph);
                myself.addVariable(pair[0], pair[1]);
                if (!myself.showingVariableWatcher(pair[0])) {
                    myself.toggleVariableWatcher(pair[0], pair[1]);
                }
                ide.flushBlocksCache('variables'); // b/c of inheritance
                ide.refreshPalette();
            }
        }
    }

    if (cat === 'motion') {

        blocks.push(block('forward'));
        blocks.push(block('arcClockwise'));
        blocks.push(block('arcCounterClockwise'));
        blocks.push('-');
        blocks.push(block('turn'));
        blocks.push(block('turnLeft'));
        blocks.push('-');
        blocks.push(block('setHeading'));
        blocks.push(block('doFaceTowards'));
        blocks.push(block('pointTowards'));
        blocks.push('-');
        blocks.push(block('gotoXY'));
        blocks.push(block('doGotoObject'));
        blocks.push('-');
        blocks.push(block('changeXPosition'));
        blocks.push(block('setXPosition'));
        blocks.push(block('changeYPosition'));
        blocks.push(block('setYPosition'));
        blocks.push('-');
        blocks.push(block('drawText'));
        blocks.push(block('getTextLength'))
        blocks.push('-');
        blocks.push(block('bounceOffEdge'));
        blocks.push('-');
        blocks.push(watcherToggle('xPosition'));
        blocks.push(block('xPosition'));
        blocks.push(watcherToggle('yPosition'));
        blocks.push(block('yPosition'));
        blocks.push(watcherToggle('direction'));
        blocks.push(block('direction'));

    /////////////////////////////////

    } else if (cat === 'other') {
        blocks.push(block('zoomToFit'));

    } else if (cat === 'cnc') {
        blocks.push(block('clearCNC'));
        blocks.push('-');
        blocks.push(block('setWorkpiece'));
        blocks.push(block('chooseMachine'));
        blocks.push(block('addMachine'));
        blocks.push('-');
        blocks.push(block('setTool'));
        blocks.push(block('getToolSize'));
        blocks.push('-');
        blocks.push(block('setSpindleSpeed'));
        blocks.push(block('setCutDepth'));
        blocks.push(block('getSafeDepth'));
        blocks.push('-');
        blocks.push(block('startCut'));
        blocks.push(block('endCut'));
        blocks.push(block('isCutting'));
        blocks.push('-');
        blocks.push(block('addTabHere'));
        blocks.push(block('addTabLocation'));

    } else if (cat === 'control') {

		    blocks.push(block('resetAll'));
		    blocks.push('-');
        blocks.push(block('receiveGo'));
        blocks.push(block('receiveKey'));
        blocks.push(block('receiveInteraction'));
        blocks.push(block('receiveCondition'));
        blocks.push(block('receiveMessage'));
        blocks.push('-');
        blocks.push(block('doBroadcast'));
        blocks.push(block('doBroadcastAndWait'));
        blocks.push(watcherToggle('getLastMessage'));
        blocks.push(block('getLastMessage'));
        blocks.push('-');
        blocks.push(block('doWarp'));
        blocks.push('-');
        blocks.push(block('doWait'));
        blocks.push(block('doWaitUntil'));
        blocks.push('-');
        blocks.push(block('doForever'));
        blocks.push(block('doRepeat'));
        blocks.push(block('doUntil'));
        blocks.push('-');
        blocks.push(block('doIf'));
        blocks.push(block('doIfElse'));
        blocks.push('-');
        blocks.push(block('doReport'));
        blocks.push('-');

        blocks.push(block('doStopThis'));
        blocks.push(block('doStopOthers'));
        blocks.push('-');
        blocks.push(block('doRun'));
        blocks.push(block('fork'));
        blocks.push(block('evaluate'));
        blocks.push('-');
    
        blocks.push(block('doCallCC'));
        blocks.push(block('reportCallCC'));
        blocks.push('-');
        blocks.push(block('receiveOnClone'));
        blocks.push(block('createClone'));
        blocks.push(block('removeClone'));
        blocks.push('-');
        blocks.push(block('doPauseAll'));

    } else if (cat === 'sensing') {

        blocks.push(block('reportTouchingObject'));
        blocks.push(block('reportTouchingColor'));
        blocks.push(block('reportColorIsTouchingColor'));
        blocks.push('-');
        blocks.push(block('doAsk'));
        blocks.push(watcherToggle('getLastAnswer'));
        blocks.push(block('getLastAnswer'));
        blocks.push('-');
        blocks.push(watcherToggle('reportMouseX'));
        blocks.push(block('reportMouseX'));
        blocks.push(watcherToggle('reportMouseY'));
        blocks.push(block('reportMouseY'));
        blocks.push(block('reportMouseDown'));
        blocks.push('-');
        blocks.push(block('reportKeyPressed'));
        blocks.push('-');
        blocks.push(block('reportDistanceTo'));
        blocks.push('-');
        blocks.push(block('doResetTimer'));
        blocks.push(watcherToggle('getTimer'));
        blocks.push(block('getTimer'));
        blocks.push('-');
        blocks.push(block('reportAttributeOf'));

        if (SpriteMorph.prototype.enableFirstClass) {
            blocks.push(block('reportGet'));
        }
        blocks.push('-');

        blocks.push(block('reportURL'));
        blocks.push(block('reportProxiedURL'));
        blocks.push('-');
        blocks.push(block('reportIsFastTracking'));
        blocks.push(block('doSetFastTracking'));
        blocks.push('-');
        blocks.push(block('reportDate'));
        blocks.push('-');


    // for debugging: ///////////////

        if (this.world().isDevMode) {

            blocks.push('-');
            txt = new TextMorph(localize(
                'development mode \ndebugging primitives:'
            ));
            txt.fontSize = 9;
            txt.setColor(this.paletteTextColor);
            blocks.push(txt);
            blocks.push('-');
            blocks.push(watcherToggle('reportThreadCount'));
            blocks.push(block('reportThreadCount'));
            blocks.push(block('colorFiltered'));
            blocks.push(block('reportStackSize'));
            blocks.push(block('reportFrameCount'));
        }

    } else if (cat === 'operators') {

        blocks.push(block('reifyScript'));
        blocks.push(block('reifyReporter'));
        blocks.push(block('reifyPredicate'));
        blocks.push('#');
        blocks.push('-');
        blocks.push(block('reportSum'));
        blocks.push(block('reportDifference'));
        blocks.push(block('reportProduct'));
        blocks.push(block('reportQuotient'));
        blocks.push(block('reportPower'));
        blocks.push('-');
        blocks.push(block('reportModulus'));
        blocks.push(block('reportRound'));
        blocks.push(block('reportMonadic'));
        blocks.push(block('reportPi'));
        blocks.push(block('reportRandom'));
        blocks.push('-');
        blocks.push(block('reportLessThan'));
        blocks.push(block('reportEquals'));
        blocks.push(block('reportGreaterThan'));
        blocks.push('-');
        blocks.push(block('reportAnd'));
        blocks.push(block('reportOr'));
        blocks.push(block('reportNot'));
        blocks.push(block('reportBoolean'));
        blocks.push('-');
        blocks.push(block('reportJoinWords'));
        blocks.push(block('reportTextSplit'));
        blocks.push(block('reportLetter'));
        blocks.push(block('reportStringSize'));
        blocks.push('-');
        blocks.push(block('reportUnicode'));
        blocks.push(block('reportUnicodeAsLetter'));
        blocks.push('-');
        blocks.push(block('reportIsA'));
        blocks.push(block('reportIsIdentical'));
        blocks.push('-');
        blocks.push(block('reportJSFunction'));

    // for debugging: ///////////////

        if (this.world().isDevMode) {
            blocks.push('-');
            txt = new TextMorph(localize(
                'development mode \ndebugging primitives:'
            ));
            txt.fontSize = 9;
            txt.setColor(this.paletteTextColor);
            blocks.push(txt);
            blocks.push('-');
            blocks.push(block('reportTypeOf'));
            blocks.push(block('reportTextFunction'));
        }

    /////////////////////////////////

    } else if (cat === 'variables') {

        button = new PushButtonMorph(
            null,
            function () {
                new VariableDialogMorph(
                    null,
                    addVar,
                    myself
                ).prompt(
                    'Variable name',
                    null,
                    myself.world()
                );
            },
            'Make a variable'
        );
        button.userMenu = helpMenu;
        button.selector = 'addVariable';
        button.showHelp = BlockMorph.prototype.showHelp;
        blocks.push(button);

        if (this.deletableVariableNames().length > 0) {
            button = new PushButtonMorph(
                null,
                function () {
                    var menu = new MenuMorph(
                        myself.deleteVariable,
                        null,
                        myself
                    );
                    myself.deletableVariableNames().forEach(function (name) {
                        menu.addItem(name, name);
                    });
                    menu.popUpAtHand(myself.world());
                },
                'Delete a variable'
            );
            button.userMenu = helpMenu;
            button.selector = 'deleteVariable';
            button.showHelp = BlockMorph.prototype.showHelp;
            blocks.push(button);
        }

        blocks.push('-');

        varNames = this.variables.allNames();
        if (varNames.length > 0) {
            varNames.forEach(function (name) {
                blocks.push(variableWatcherToggle(name));
                blocks.push(variableBlock(name));
            });
            blocks.push('-');
        }

        blocks.push(block('doSetVar'));
        blocks.push(block('doChangeVar'));
        blocks.push(block('doShowVar'));
        blocks.push(block('doHideVar'));
        blocks.push(block('doDeclareVariables'));

    // inheritance:

        if (StageMorph.prototype.enableInheritance) {
            blocks.push('-');
            blocks.push(block('doDeleteAttr'));
        }

    ///////////////////////////////

        blocks.push('=');

        blocks.push(block('reportNewList'));
        blocks.push('-');
        blocks.push(block('reportCONS'));
        blocks.push(block('reportListItem'));
        blocks.push(block('reportCDR'));
        blocks.push('-');
        blocks.push(block('reportListLength'));
        blocks.push(block('reportListContainsItem'));
        blocks.push('-');
        blocks.push(block('doAddToList'));
        blocks.push(block('doDeleteFromList'));
        blocks.push(block('doInsertInList'));
        blocks.push(block('doReplaceInList'));

    // for debugging: ///////////////

        if (this.world().isDevMode) {
            blocks.push('-');
            txt = new TextMorph(localize(
                'development mode \ndebugging primitives:'
            ));
            txt.fontSize = 9;
            txt.setColor(this.paletteTextColor);
            blocks.push(txt);
            blocks.push('-');
            blocks.push(block('reportMap'));
            blocks.push('-');
            blocks.push(block('doForEach'));
            blocks.push(block('doShowTable'));
        }

    /////////////////////////////////

        blocks.push('=');

        if (StageMorph.prototype.enableCodeMapping) {
            blocks.push(block('doMapCodeOrHeader'));
            blocks.push(block('doMapStringCode'));
            blocks.push(block('doMapListCode'));
            blocks.push('-');
            blocks.push(block('reportMappedCode'));
            blocks.push('=');
        }

        button = new PushButtonMorph(
            null,
            function () {
                var ide = myself.parentThatIsA(IDE_Morph),
                    stage = myself.parentThatIsA(StageMorph);
                new BlockDialogMorph(
                    null,
                    function (definition) {
                        if (definition.spec !== '') {
                            if (definition.isGlobal) {
                                stage.globalBlocks.push(definition);
                            } else {
                                myself.customBlocks.push(definition);
                            }
                            ide.flushPaletteCache();
                            ide.refreshPalette();
                            new BlockEditorMorph(definition, myself).popUp();
                        }
                    },
                    myself
                ).prompt(
                    'Make a block',
                    null,
                    myself.world()
                );
            },
            'Make a block'
        );
        button.userMenu = helpMenu;
        button.selector = 'addCustomBlock';
        button.showHelp = BlockMorph.prototype.showHelp;
        blocks.push(button);
    }
    return blocks;
};

SpriteMorph.prototype.bounceOffEdge = function () {
    // taking nested parts into account
    var stage = this.parentThatIsA(StageMorph),
        fb = this.nestingBounds(),
        dirX,
        dirY;

    if (!stage) {return null; }
    if (stage.bounds.containsRectangle(fb)) {return null; }

    dirX = Math.cos(radians(this.heading - 90));
    dirY = -(Math.sin(radians(this.heading - 90)));

    if (fb.left() < stage.left()) {
        dirX = Math.abs(dirX);
    }
    if (fb.right() > stage.right()) {
        dirX = -(Math.abs(dirX));
    }
    if (fb.top() < stage.top()) {
        dirY = -(Math.abs(dirY));
    }
    if (fb.bottom() > stage.bottom()) {
        dirY = Math.abs(dirY);
    }

    this.setHeading(degrees(Math.atan2(-dirY, dirX)) + 90);

};


// ########################################################################
/* STAGE */
// ########################################################################

// StageMorph

StageMorph.prototype.originalDestroy = StageMorph.prototype.destroy;
StageMorph.prototype.destroy = function () {
    var myself = this;
    this.clearAll();
    this.children.forEach(function (eachSprite) {
        myself.removeChild(eachSprite);
    });
    this.originalDestroy();
};

StageMorph.prototype.originalInit = StageMorph.prototype.init;
StageMorph.prototype.init = function (globals) {
    var myself = this;

    console.log("init stage");
    this.turtleShepherd = new TurtleShepherd();
    this.turtleShepherd.ignoreWarning = StageMorph.prototype.ignoreWarnings;

    this.originalInit(globals);
    this.initScene();
    this.initRenderer();
    this.initCamera();
    this.fonts = null;
    this.stepcounter = 0;

	// load customized fonts based on Hershey's fonts.

	function loadFont(callback) {
		var xobj = new XMLHttpRequest();
		xobj.overrideMimeType("application/json");
		xobj.open('GET', 'cnccode/fonts/simplex.json', true);
		xobj.onreadystatechange = function () {
			  if (xobj.readyState == 4 && xobj.status == "200") {
				callback(xobj.responseText);
			  }
		};
		xobj.send(null);
	}

    if (!this.fonts) {
		loadFont(function(response) {
			myself.fonts = JSON.parse(response);
		});
	}

    this.scene.grid.draw();
    this.myObjects = new THREE.Object3D();
    this.myTabs = new THREE.Object3D();
    this.myStopPoints = new THREE.Object3D();
    this.myCutLines = new THREE.Object3D();
    this.myArcCuts = new THREE.Object3D();
    this.myJumpLines = new THREE.Object3D();
    this.myJumpArcs = new THREE.Object3D();
    this.scene.add(this.myObjects);
    this.scene.add(this.myTabs);
    this.scene.add(this.myStopPoints);
    this.scene.add(this.myCutLines);
    this.scene.add(this.myArcCuts);
    this.scene.add(this.myJumpLines);
    this.scene.add(this.myJumpArcs);

    this.initTurtle();
};

StageMorph.prototype.initScene = function () {
    var myself = this;
    this.scene = new THREE.Scene();
    this.scene.grid = {};
    this.scene.grid.defaultColor = 0xe0e0e0;
    this.scene.grid.interval = new Point(5, 5);
    console.log("init scene");

    // Grid
    this.scene.grid.draw = function () {
      console.log("draw grid");

        //var color = this.lines ? this.lines[0].material.color : this.defaultColor;
        var color = 0xf6f6f6;
        var color2 = 0xe0e0e0;

        if (this.lines) {
            this.lines.forEach(function (eachLine){
                myself.scene.remove(eachLine);
            });
        }

        this.lines = [];

		c = 2.54;
		if (myself.turtleShepherd.isMetric()) {
			this.interval = new Point(5, 5);
			limit = this.interval.x * 50;
		} else {
			this.interval = new Point(Math.round(5 * c), Math.round(5 * c));
			limit = Math.round(this.interval.x * 50 * c);
		}
        for (x = -limit / this.interval.x; x <= limit / this.interval.x; x++) {
            p1 = new THREE.Vector3(x * this.interval.x, -limit, 0);
            p2 = new THREE.Vector3(x * this.interval.x, limit, 0);
            l = myself.scene.addLineFromPointToPointWithColor(p1, p2, color);
            l.visible = !StageMorph.prototype.hideGrid;
            this.lines.push(l);
        }

        for (y = -limit / this.interval.y; y <= limit / this.interval.y; y++) {
            p1 = new THREE.Vector3(-limit, y * this.interval.y, 0);
            p2 = new THREE.Vector3(limit, y * this.interval.y, 0);
            l = myself.scene.addLineFromPointToPointWithColor(p1, p2, color);
            l.visible = !StageMorph.prototype.hideGrid;
            this.lines.push(l);
        }

		if (myself.turtleShepherd.isMetric())
			limit = this.interval.x * 200;
		else
			limit = Math.round(this.interval.x * 200 * c);


        for (x = -limit/10 / this.interval.x; x <= limit/10 / this.interval.x; x++) {
            p1 = new THREE.Vector3(x * this.interval.x * 10, -limit,0);
            p2 = new THREE.Vector3(x * this.interval.x* 10, limit,0);
            l = myself.scene.addLineFromPointToPointWithColor(p1, p2, color2);
            l.visible = !StageMorph.prototype.hideGrid;
            this.lines.push(l);
        }

        for (y = -limit/10 / this.interval.y; y <= limit/10 / this.interval.y ; y++) {
            p1 = new THREE.Vector3(-limit, y * this.interval.y * 10, 0);
            p2 = new THREE.Vector3(limit, y * this.interval.y * 10, 0);
            l = myself.scene.addLineFromPointToPointWithColor(p1, p2, color2);
            l.visible = !StageMorph.prototype.hideGrid;
            this.lines.push(l);
        }

        myself.reRender();
    };

    this.scene.grid.setInterval = function (aPoint) {
        this.interval = aPoint;
        this.draw();
    };

    this.scene.grid.setColor = function (color) {
        this.lines.forEach(function (eachLine) {
            eachLine.material.color.setHex(color);
        });
    };

    this.scene.grid.toggle = function () {
        StageMorph.prototype.hideGrid = !StageMorph.prototype.hideGrid;
        this.lines.forEach(function (line){
          line.visible = !StageMorph.prototype.hideGrid;
        });
        myself.reRender();
    };

};

StageMorph.prototype.clearAll = function () {
    /*for (var i = this.myObjects.children.length - 1; i >= 0; i--) {
        this.myObjects.remove(this.myObjects.children[i]);
    }*/
    for (i = this.myCutLines.children.length - 1; i >= 0; i--) {
        this.myCutLines.remove(this.myCutLines.children[i]);
    }
    for (i = this.myArcCuts.children.length - 1; i >= 0; i--) {
        this.myArcCuts.remove(this.myArcCuts.children[i]);
    }
    for (i = this.myStopPoints.children.length - 1; i >= 0; i--) {
        this.myStopPoints.remove(this.myStopPoints.children[i]);
    }
    for (i = this.myTabs.children.length - 1; i >= 0; i--) {
        this.myTabs.remove(this.myTabs.children[i]);
    }
    for (i = this.myJumpLines.children.length - 1; i >= 0; i--) {
        this.myJumpLines.remove(this.myJumpLines.children[i]);
    }
    for (i = this.myJumpArcs.children.length - 1; i >= 0; i--) {
        this.myJumpArcs.remove(this.myJumpArcs.children[i]);
    }

    this.renderer.clear();
};

StageMorph.prototype.initRenderer = function () {
    var myself = this;

    console.log("set up renderer");

    if(!this.renderer) {
      if (Detector.webgl) {
          this.renderer = new THREE.WebGLRenderer({
              antialias: true,
              alpha: true,
              canvas: this.penTrails()
          });
          console.log("webgl enabled");
          this.renderer_status_msg = "webgl enabled";

      } else {
  		console.log("webgl unavailable. fallback to canvas (SLOW!)");
  		this.renderer_status_msg = "webgl unavailable. fallback to canvas (SLOW!)";
          this.renderer = new THREE.CanvasRenderer(
              {canvas: this.penTrails()});
      }


      this.renderer.setBackgroundColor = function(color) {
        StageMorph.prototype.backgroundColor  = color;
        myself.renderer.setClearColor(
            new THREE.Color("rgb("+color.r + "," + color.g + "," + color.b + ")"),
        1);
        myself.reRender();
      }

      this.renderer.setBackgroundColor(StageMorph.prototype.backgroundColor);

      this.renderer.changed = false;
      this.renderer.showingAxes = true;
      this.renderer.isParallelProjection = true;
    }

    this.renderer.toggleJumpLines = function () {
        StageMorph.prototype.hideJumps = !StageMorph.prototype.hideJumps;
        myself.myJumpLines.children.forEach(function (eachObject) {
            eachObject.visible = !StageMorph.prototype.hideJumps
        });
        myself.reRender();
    };

    this.renderer.toggleTurtle = function () {
        StageMorph.prototype.hideTurtle = !StageMorph.prototype.hideTurtle;
        myself.turtle.visible = !StageMorph.prototype.hideTurtle;
        myself.reRender();
    };


    this.renderer.setBackgroundColorHex = function(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;

    	hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    		return r + r + g + g + b + b;
    	});

    	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    	if (result) {
    		r = parseInt(result[1], 16);
    		g = parseInt(result[2], 16);
    		b = parseInt(result[3], 16);
        StageMorph.prototype.backgroundColor = new Color(r, g, b);
    		myself.renderer.setBackgroundColor(StageMorph.prototype.backgroundColor);
      }
      myself.reRender();
    }

    this.renderer.setDefaultPenColorHex = function(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
      var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;

      hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
      });

      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (result) {
        r = parseInt(result[1], 16);
        g = parseInt(result[2], 16);
        b = parseInt(result[3], 16);
        StageMorph.prototype.defaultPenColor = new Color(r, g, b);
      }
      myself.reRender();
    }

};


StageMorph.prototype.render = function () {
    this.renderer.render(this.scene, this.camera);
};

StageMorph.prototype.renderCycle = function () {
    if (this.renderer.changed) {
        this.render();
        this.changed();
        this.parentThatIsA(IDE_Morph).statusDisplay.refresh();
        this.renderer.changed = false;
    }
};

StageMorph.prototype.reRender = function () {
    this.renderer.changed = true;
};

StageMorph.prototype.initCamera = function () {
    var myself = this,
        threeLayer;

    if (this.scene.camera) { this.scene.remove(this.camera); }

    var createCamera = function () {
        threeLayer = document.createElement('div');

        if (myself.renderer.isParallelProjection) {
            var zoom = myself.camera ? myself.camera.zoomFactor : 82,
                width = Math.max(myself.width(), 480),
                height = Math.max(myself.height(), 360);

            myself.camera = new THREE.OrthographicCamera(
                    width / - zoom,
                    width / zoom,
                    height / zoom,
                    height / - zoom,
                    0.1,
                    10000);
        } else {
            myself.camera = new THREE.PerspectiveCamera(60, 480/360);
        }

        // We need to implement zooming ourselves for parallel projection

        myself.camera.zoomIn = function () {
            this.zoomFactor /= 1.1;
            this.applyZoom();
        };
        myself.camera.zoomOut = function () {
            this.zoomFactor *= 1.1;
            this.applyZoom();
        };

        myself.camera.getZoom = function () {
            return this.zoomFactor;
        };

        myself.camera.applyZoom = function () {
            var zoom = myself.camera ? myself.camera.zoomFactor : 2,
                width = Math.max(myself.width(), 480),
                height = Math.max(myself.height(), 360);
            this.left = width / - zoom;
            this.right = width / zoom;
            this.top = height / zoom;
            this.bottom = height / - zoom;
            this.updateProjectionMatrix();
        };

        myself.camera.reset = function () {

            myself.controls = new THREE.OrbitControls(this, threeLayer);
            myself.controls.addEventListener('change', function (event) { myself.render(); });

            if (myself.renderer.isParallelProjection) {
                this.zoomFactor = 1.7;
                this.applyZoom();
                this.position.set(0,0,10);
            } else {
                this.position.set(0,0,10);
            }

            myself.controls.update();
            myself.reRender();
        };

        myself.camera.fitScene = function () {


            var boundingBox = new THREE.Box3().setFromObject(myself.myCutLines),
                boundingSphere = boundingBox.getBoundingSphere(),
                center = boundingSphere.center,
                distance = boundingSphere.radius;

            if(distance > 0) {
				var width = Math.max(myself.width(), 480),
                height = Math.max(myself.height(), 360);

				this.zoomFactor = Math.max(width / distance, height / distance) * 0.90;
				this.applyZoom();

				this.position.set(center.x, center.y, 10);
				myself.controls.center.set(center.x, center.y, 10);

				myself.controls.update();
				myself.reRender();
			}
        };
    };

    createCamera();
    this.scene.add(this.camera);
    this.camera.reset();
};

StageMorph.prototype.initTurtle = function() {
    var myself = this;
    var geometry = new THREE.Geometry();
    var material = new THREE.MeshBasicMaterial( { color: 0x000000, opacity:0.7,side:THREE.DoubleSide, transparent:true } );
	this.turtle = new THREE.Mesh(new THREE.Geometry(), material);

    if (typeof this.turtle.loaded === 'undefined') {

		var loader = new THREE.JSONLoader();

		loader.load( 'cnccode/assets/turtle.js',

			function ( geometry, materials ) {
				//var material = materials[ 0 ];
				this.turtle = new THREE.Mesh(geometry,material);
				this.turtle.scale.set(4, 4, 4);
				this.turtle.position.z = 0.02;
				this.turtle.rotation.x = 90 * Math.PI / 180;
				this.turtle.rotation.y = 270 * Math.PI / 180;
				//this.turtle.material.color = new THREE.Color("rgb(1,0,0)" );

				myself.turtle = this.turtle;
				myself.turtle.visible = !StageMorph.prototype.hideTurtle;
				myself.renderer.changed = true;
				myself.myObjects.add(this.turtle);
				this.turtle.loaded = true;
			},

			// onProgress callback
			function ( xhr ) {
				//console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
			},

			// onError callback
			function( err ) {
				console.log( 'error loading turtle shape' );
			}
		);

    }
    this.penSize = 1;
};

StageMorph.prototype.moveTurtle = function(x, y) {
    this.turtle.position.x = x;
    this.turtle.position.y = y;
};

StageMorph.prototype.setPenSize = function(s) {
    this.penSize = s;
};

StageMorph.prototype.rotateTurtle = function(h) {
    this.turtle.rotation.y = (-h) * Math.PI / 180;
    this.renderer.changed = true;
};

StageMorph.prototype.originalStep = StageMorph.prototype.step;
StageMorph.prototype.step = function () {
    this.originalStep();

    if (!(this.isFastTracked && this.threads.processes.length)) {
		this.renderCycle();
	} else {
		if (this.stepcounter % 12 == 0) {
			this.renderCycle();
		}
	};


	this.stepcounter++;
};

StageMorph.prototype.referencePos = null;

StageMorph.prototype.mouseScroll = function (y, x) {
    if (this.renderer.isParallelProjection) {
        if (y > 0) {
            this.camera.zoomOut();
        } else if (y < 0) {
            this.camera.zoomIn();
        }
    } else {
        if (y > 0) {
            this.controls.dollyOut();
        } else if (y < 0) {
            this.controls.dollyIn();
        }
        this.controls.update();
    }
    this.renderer.changed = true;
};

StageMorph.prototype.mouseDownLeft = function (pos) {
    this.referencePos = pos;
};

StageMorph.prototype.mouseDownRight = function (pos) {
    this.referencePos = pos;
};

StageMorph.prototype.mouseMove = function (pos, button) {

    if (this.referencePos === null) { return };

    var factor = this.renderer.isParallelProjection ? 65 / this.camera.zoomFactor : this.controls.object.position.length() / 10,
        deltaX = (pos.x - this.referencePos.x),
        deltaY = (pos.y - this.referencePos.y);

    this.referencePos = pos;

    if (button === 'right' || this.world().currentKey === 16 || button === 'left') { // shiftClicked
        this.controls.panLeft(deltaX / this.dimensions.x / this.scale * 15 * factor);
        this.controls.panUp(deltaY / this.dimensions.y / this.scale * 10 * factor);
    } else {
        var horzAngle = deltaX / (this.dimensions.x * this.scale) * 360;
        var vertAngle = deltaY / (this.dimensions.y * this.scale) * 360;
        this.controls.rotateLeft(radians(horzAngle));
        this.controls.rotateUp(radians(vertAngle));
    }

    this.controls.update();
    this.reRender();
};

StageMorph.prototype.mouseLeave = function () {
    this.referencePos = null;
};

// StageMorph Mouse Coordinates

StageMorph.prototype.reportMouseX = function () {
    var world = this.world();
    if (world) {
        return ((world.hand.position().x - this.center().x) / this.scale)  / this.camera.zoomFactor * 2 + this.controls.center.x;
    }
    return 0;
};

StageMorph.prototype.reportMouseY = function () {
    var world = this.world();
    if (world) {
        return ((this.center().y - world.hand.position().y) / this.scale)  / this.camera.zoomFactor * 2 + this.controls.center.y;
    }
    return 0;
};

StageMorph.prototype.clearPenTrails = nop;

StageMorph.prototype.penTrails = function () {
    if (!this.trailsCanvas) {
        this.trailsCanvas = newCanvas(this.dimensions, true);
    }
    return this.trailsCanvas;
};

// StageMorph drawing
StageMorph.prototype.originalDrawOn = StageMorph.prototype.drawOn;
StageMorph.prototype.drawOn = function (aCanvas, aRect) {
    // If the scale is lower than 1, we reuse the original method,
    // otherwise we need to modify the renderer dimensions
    // we do not need to render the original canvas anymore because
    // we have removed sprites and backgrounds

    var rectangle, area, delta, src, context, w, h, sl, st;
    if (!this.isVisible) {
        return null;
    }
    /*
    if (this.scale < 1) {
        return this.originalDrawOn(aCanvas, aRect);
    }*/

    rectangle = aRect || this.bounds;
    area = rectangle.intersect(this.bounds).round();
    if (area.extent().gt(new Point(0, 0))) {
        delta = this.position().neg();
        src = area.copy().translateBy(delta).round();
        context = aCanvas.getContext('2d');
        context.globalAlpha = this.alpha;

        sl = src.left();
        st = src.top();
        w = Math.min(src.width(), this.image.width - sl);
        h = Math.min(src.height(), this.image.height - st);

        if (w < 1 || h < 1) {
            return null;
        }
        // we only draw pen trails!
        context.save();
        context.clearRect(
            area.left(),
            area.top() ,
            w,
            h);
        try {
            context.drawImage(
                this.penTrails(),
                sl,
                st,
                w,
                h,
                area.left(),
                area.top(),
                w,
                h
            );
        } catch (err) { // sometimes triggered only by Firefox
            console.log(err);
        }
        context.restore();
    }
};

StageMorph.prototype.originalSetScale = StageMorph.prototype.setScale;
StageMorph.prototype.setScale = function (number) {
    this.scaleChanged = true;
    this.originalSetScale(number);
    this.camera.aspect = this.extent().x / this.extent().y;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.extent().x, this.extent().y);
    this.renderer.changed = true;
};


// Contextual menu
StageMorph.prototype.userMenu = function () {
    var ide = this.parentThatIsA(IDE_Morph),
        menu = new MenuMorph(this),
        shiftClicked = this.world().currentKey === 16,
        myself = this;

    if (ide && ide.isAppMode) {
        menu.hide();
        return menu;
    }
    menu.addItem(
            'pic...',
            function () {
                window.open(myself.fullImageClassic().toDataURL());
            },
            'open a new window\nwith a picture of the scene'
            );
    return menu;
};


StageMorph.prototype.toggleIgnoreWarnings = function () {
	StageMorph.prototype.ignoreWarnings = !StageMorph.prototype.ignoreWarnings;
	this.turtleShepherd.ignoreWarning = StageMorph.prototype.ignoreWarnings;
}


// Caches

var Cache;

Cache.prototype = {};
Cache.prototype.constructor = Cache;
Cache.uber = Object.prototype;

function Cache () {
    this.init();
};

Cache.prototype.init = function () {
    this.materials = [];
    this.geometries = { stitch: [], circle: [], jumpArc: [], arc: [], plane: [], meshline: [] };
    this.segments = [];
};

Cache.prototype.clear = function () {
    this.init();
};

Cache.prototype.addMaterial = function (material) {
    this.materials.push(material);
};

Cache.prototype.findMaterial = function (color, opacity) {
    return detect(
		this.materials,
		function (each) {
			return each.color.r == color.r && each.color.g == color.g && each.color.b == color.b && each.opacity == opacity;
		});
};

Cache.prototype.addGeometry = function (type, geometry, params) {
    this.geometries[type].push({ params: params, geometry: geometry });
};

Cache.prototype.findGeometry = function (type, params) {

    var geometry = detect(
            this.geometries[type],
            function (each) {
                return (each.params.length === params.length)
                    && each.params.every(function (element, index) {
                        return element === params[index];
                    })
            });

    if (geometry) {
        return geometry.geometry;
    } else {
        return null;
    }
};

Cache.prototype.clearSegments = function () {
    this.segments = [];
}
