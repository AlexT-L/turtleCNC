
VERSION="1.0"
SERVERURL = document.URL

// get debug mode
url = new URL(window.location.href);
searchParams = new URLSearchParams(url.search);
var DEBUG = (searchParams.get("debug") == "true")

// Force flat design
IDE_Morph.prototype.setDefaultDesign = IDE_Morph.prototype.setFlatDesign;

// ad some padding
IDE_Morph.prototype.originalInit = IDE_Morph.prototype.init;
IDE_Morph.prototype.init = function(isAutoFill) {
    this.originalInit();
    this.padding = 1;
	/*
	 this.droppedText(
		this.getURL(this.resourceURL('stitchcode/embroidery-library.xml')),
		'Embroidery tools'
	);
	*/
	//this.isAnimating = false;
    this.paletteWidth = 250; // initially same as logo width
    //MorphicPreferences.globalFontFamily = 'Sans, Helvetica, Arial';
	this.cloud = new BeetleCloud('/api', this);
};

//  change logo
IDE_Morph.prototype.originalCreateLogo = IDE_Morph.prototype.createLogo;
IDE_Morph.prototype.createLogo = function () {
	this.originalCreateLogo();
	//if (MorphicPreferences.isFlat) {
	// we are always flat!
	this.logo.texture = 'stitchcode/turtleCNC_logo.png';
	this.logo.color = new Color(230, 230, 230);
	this.logo.drawNew();
};

IDE_Morph.prototype.createPalette = function (forSearching) {
    // assumes that the logo pane has already been created
    // needs the categories pane for layout
    var myself = this;

    if (this.palette) {
        this.palette.destroy();
    }

    if (forSearching) {
        this.palette = new ScrollFrameMorph(
            null,
            null,
            this.currentSprite.sliderColor
        );

        // search toolbar (floating cancel button):
        /* commented out for now
        this.palette.toolBar = new PushButtonMorph(
            this,
            function () {
                myself.refreshPalette();
                myself.palette.adjustScrollBars();
            },
            new SymbolMorph("magnifierOutline", 16)
        );
        this.palette.toolBar.alpha = 0.2;
        this.palette.toolBar.padding = 1;
        // this.palette.toolBar.hint = 'Cancel';
        this.palette.toolBar.labelShadowColor = new Color(140, 140, 140);
        this.palette.toolBar.drawNew();
        this.palette.toolBar.fixLayout();
        this.palette.add(this.palette.toolBar);
	    */
    } else {
        this.palette = this.currentSprite.palette(this.currentCategory);
    }
    this.palette.isDraggable = false;
    this.palette.acceptsDrops = true;
    this.palette.enableAutoScrolling = false;
    this.palette.contents.acceptsDrops = false;

    this.palette.reactToDropOf = function (droppedMorph, hand) {
        if (droppedMorph instanceof DialogBoxMorph) {
            myself.world().add(droppedMorph);
        } else if (droppedMorph instanceof SpriteMorph) {
            myself.removeSprite(droppedMorph);
        } else if (droppedMorph instanceof SpriteIconMorph) {
            droppedMorph.destroy();
            myself.removeSprite(droppedMorph.object);
        } else if (droppedMorph instanceof CostumeIconMorph) {
            myself.currentSprite.wearCostume(null);
            droppedMorph.perish();
        } else if (droppedMorph instanceof BlockMorph) {
            myself.stage.threads.stopAllForBlock(droppedMorph);
            if (hand && hand.grabOrigin.origin instanceof ScriptsMorph) {
                hand.grabOrigin.origin.clearDropInfo();
                hand.grabOrigin.origin.lastDroppedBlock = droppedMorph;
                hand.grabOrigin.origin.recordDrop(hand.grabOrigin);
            }
            droppedMorph.perish();
        } else {
            droppedMorph.perish();
        }
    };

    this.palette.contents.reactToDropOf = function (droppedMorph) {
        // for "undrop" operation
        if (droppedMorph instanceof BlockMorph) {
            droppedMorph.destroy();
        }
    };

    this.palette.setWidth(this.logo.width());
    this.add(this.palette);
    return this.palette;
};



IDE_Morph.prototype.resourceURLOrig  = IDE_Morph.prototype.resourceURL;
IDE_Morph.prototype.resourceURL = function () {
    var args = Array.prototype.slice.call(arguments, 0);
    if (args[0] == "Backgrounds" || args[0] == "Examples")
        return 'stitchcode/' + args[0] + '/' + args[1];
    else {
        return args.join('/');
    }
};

// Single Sprite mode, no corral and no tabs in the scripting area
IDE_Morph.prototype.createCorralBar = nop;
IDE_Morph.prototype.createCorral = nop;

// build panes (do not add all)
IDE_Morph.prototype.buildPanes = function () {
    this.createLogo();
    this.createControlBar();
    this.createCategories();
    this.createPalette();
    this.createStage();
    this.createSpriteBar();
    this.createSpriteEditor();
    //this.createCorralBar();
    //this.createCorral();
    this.createStatusDisplay();
    this.createStageHandle();
    this.createPaletteHandle();
    this.applySavedTurtleStitchSettings();

};

IDE_Morph.prototype.applySavedTurtleStitchSettings = function () {
  units = this.getSetting('units'),
  hidegrid = this.getSetting('hidegrid');
  hidejumps = this.getSetting('hidejumps');
  hideturtle = this.getSetting('hideturtle');
  hidestitches = this.getSetting('hidestitches');
  warnings = this.getSetting('ignoreWarning');
  isImperial = this.getSetting('isImperial');
  backgroundColor = this.getSetting('backgroundColor')
  defaultPenColor = this.getSetting('defaultPenColor')

  console.log("apply settings");

  if(hidegrid) {
    this.stage.scene.grid.toggle();
    //StageMorph.prototype.hideGrid = true;
  }
  else {
    StageMorph.prototype.hideGrid = false;
  }

  if(hidejumps) {
    //StageMorph.prototype.hideJumps = true;
    this.stage.renderer.toggleJumpLines()
  } else {
    StageMorph.prototype.hideJumps = false;
  }

  if(hideturtle) {
    this.stage.renderer.toggleTurtle()
    //StageMorph.prototype.hideTurtle = true;
  } else {
    StageMorph.prototype.hideTurtle = false;
  }

  if(hidestitches) {
    this.stage.renderer.toggleStitchPoints()
    //StageMorph.prototype.hideStitches = true;
  } else {
    StageMorph.prototype.hideStitches = false;
  }

  if(warnings) {
   this.stage.toggleIgnoreWarnings();
	 //StageMorph.prototype.ignoreWarnings = true;
  } else {
	 StageMorph.prototype.ignoreWarnings = false;
  }

  if(isImperial) {
    this.stage.turtleShepherd.toggleMetric();
    this.stage.scene.grid.draw();
    this.stage.renderer.changed = true;
  } else {
    this.stage.turtleShepherd.sMetric = true;
  }

  if (backgroundColor) {
    this.stage.renderer.setBackgroundColorHex(backgroundColor);
  } else {
    this.stage.renderer.setBackgroundColorHex('#fffffff');
  }

  if (defaultPenColor) {
    this.stage.renderer.setDefaultPenColorHex(defaultPenColor);
    this.currentSprite.setColor(StageMorph.prototype.defaultPenColor);
  } else {
    this.stage.renderer.setDefaultPenColorHex('#000000');
  }

}

IDE_Morph.prototype.unitsMenu = function () {
    var menu = new MenuMorph(this),
        world = this.world(),
        pos = this.controlBar.turtlestitchButton.bottomLeft(),
        myself = this;

    menu.addItem(
        (true ? '\u2713 ' : '    ') +   "pixel",
        function () {
            myself.setUnits("pixel");
        }
    );
    menu.addItem(
        (this.units === "millimeter" ? '\u2713 ' : '    ') +   "millimeter",
        function () {
            myself.setUnits("millimeter");
        }
    );
    menu.addItem(
        (this.units === "inch" ? '\u2713 ' : '    ') +   "inch",
        function () {
            myself.setUnits("inch");
        }
    );
    menu.popup(world, pos);
};


IDE_Morph.prototype.setUnits = function (unit) {
   // TODO:
}


StageHandleMorph.prototype.init = function (target) {
    this.target = target || null;
    HandleMorph.uber.init.call(this);
    this.color = MorphicPreferences.isFlat ?
            new Color(125, 125, 125) : new Color(190, 190, 190);
    this.isDraggable = false;
    this.noticesTransparentClick = true;
    this.setExtent(new Point(12, 50));
};

PaletteHandleMorph.prototype.init = function (target) {
    this.target = target || null;
    HandleMorph.uber.init.call(this);
    this.color = MorphicPreferences.isFlat ?
            new Color(125, 125, 125) : new Color(190, 190, 190);
    this.isDraggable = false;
    this.noticesTransparentClick = true;
    this.setExtent(new Point(12, 50));
};

IDE_Morph.prototype.origSetStageExtent = IDE_Morph.prototype.setStageExtent;
IDE_Morph.prototype.setStageExtent = function (aPoint) {
    this.origSetStageExtent(aPoint);
};

IDE_Morph.prototype.origNewProject = IDE_Morph.prototype.newProject;
IDE_Morph.prototype.newProject = function () {
    //this.origNewProject();
    this.source = this.cloud.username ? 'cloud' : 'local';
    if (this.stage) {
        this.stage.destroy();
    }
    if (location.hash.substr(0, 6) !== '#lang:') {
        location.hash = '';
    }
    this.globalVariables = new VariableFrame();
    this.currentSprite = new SpriteMorph(this.globalVariables);
    this.sprites = new List([this.currentSprite]);
    StageMorph.prototype.dimensions = new Point(480, 360);
    StageMorph.prototype.hiddenPrimitives = {};
    StageMorph.prototype.codeMappings = {};
    StageMorph.prototype.codeHeaders = {};
    StageMorph.prototype.enableCodeMapping = false;
    StageMorph.prototype.enableInheritance = true;
    StageMorph.prototype.enableSublistIDs = false;

    StageMorph.prototype.hideGrid = false;
    StageMorph.prototype.hideJumps = false;
    StageMorph.prototype.hideTurtle = false;
    StageMorph.prototype.hidestitches = false;
    StageMorph.prototype.ignoreWarnings = false;

    StageMorph.prototype.backgroundColor = new Color(255,255,255);
    StageMorph.prototype.penColor = new Color(255,255,255);

    SpriteMorph.prototype.useFlatLineEnds = false;

    Process.prototype.enableLiveCoding = false;
    this.setProjectName('');
    this.projectNotes = '';
    this.createStage();
    this.add(this.stage);
    this.createCorral();
    this.selectSprite(this.stage.children[0]);
    this.fixLayout();
    this.stage.reRender();
    this.createStatusDisplay();
};

IDE_Morph.prototype.origRawOpenProjectString = IDE_Morph.prototype.rawOpenProjectString;
IDE_Morph.prototype.rawOpenProjectString = function (str) {
    this.origRawOpenProjectString(str);

    // hide sprite
    this.stage.children[0].hide();
    this.stage.clearAll();
    this.stage.rotateTurtle(this.stage.children[0].heading);
    this.createStatusDisplay();
    // clear stitch cache now (loading projects sends turtle move commands!)
    this.stage.clearAll();
    this.stage.turtleShepherd.clear();
    this.stage.reRender();
};


/*

TODO: remove sprite instead of hideing it?

IDE_Morph.prototype.originalRemoveSprite = IDE_Morph.prototype.removeSprite;
IDE_Morph.prototype.removeSprite = function (sprite) {
    var stage = sprite.parentThatIsA(StageMorph);
    stage.scene.remove(sprite.beetle);
    stage.reRender();
    this.originalRemoveSprite(sprite);
};

*/

// Create contol bar - (and add custom buttons)
IDE_Morph.prototype.createControlBar = function () {
    // assumes the logo has already been created
    var padding = 4,
        button,
        stopButton,
        pauseButton,
        startButton,
        projectButton,
        settingsButton,
        //steppingButton,
        stageSizeButton,
        zoomToFitButton,
        //largeStageSizeButton,
        appModeButton,
        cloudButton,
        upstitchButton,
        x,
        colors = [
            this.groupColor,
            this.frameColor.darker(50),
            this.frameColor.darker(50)
        ],
        myself = this;

    if (this.controlBar) {
        this.controlBar.destroy();
    }

    this.controlBar = new Morph();
    //this.controlBar.color = this.frameColor;
	this.controlBar.color = new Color(250, 250, 250);
    this.controlBar.setHeight(this.logo.height()); // height is fixed
    this.controlBar.mouseClickLeft = function () {
        this.world().fillPage();
    };
    this.add(this.controlBar);

    //smallStageButton
    button = new ToggleButtonMorph(
        null, //colors,
        myself, // the IDE is the target
        'toggleStageSize',
        [
            new SymbolMorph('smallStage', 14),
            new SymbolMorph('normalStage', 14)
        ],
        function () {  // query
            return myself.isSmallStage;
        }
    );

    button.corner = 12;
    button.color = colors[0];
    button.highlightColor = colors[1];
    button.pressColor = colors[2];
    button.labelMinExtent = new Point(36, 18);
    button.padding = 0;
    button.labelShadowOffset = new Point(-1, -1);
    button.labelShadowColor = colors[1];
    button.labelColor = this.buttonLabelColor;
    button.contrast = this.buttonContrast;
    button.drawNew();
    // button.hint = 'stage size\nsmall & normal';
    button.fixLayout();
    button.refresh();
    stageSizeButton = button;
    this.controlBar.add(stageSizeButton);
    this.controlBar.stageSizeButton = button; // for refreshing

    //appModeButton
    button = new ToggleButtonMorph(
        null, //colors,
        myself, // the IDE is the target
        'toggleAppMode',
        [
            new SymbolMorph('fullScreen', 14),
            new SymbolMorph('normalScreen', 14)
        ],
        function () {  // query
            return myself.isAppMode;
        }
    );

    button.corner = 12;
    button.color = colors[0];
    button.highlightColor = colors[1];
    button.pressColor = colors[2];
    button.labelMinExtent = new Point(36, 18);
    button.padding = 0;
    button.labelShadowOffset = new Point(-1, -1);
    button.labelShadowColor = colors[1];
    button.labelColor = this.buttonLabelColor;
    button.contrast = this.buttonContrast;
    button.drawNew();
    // button.hint = 'app & edit\nmodes';
    button.fixLayout();
    button.refresh();
    appModeButton = button;
    this.controlBar.add(appModeButton);
    this.controlBar.appModeButton = appModeButton; // for refreshing



    // zoomToFitButton
    //appModeButton

    button = new ToggleButtonMorph(
        null, //colors,
        this, // the IDE is the target
        'zoomToFit', new SymbolMorph('zoomToFit', 14),
        function () {  // query
            return false;
        }
    );

    button.corner = 12;
    button.color = colors[0];
    button.highlightColor = colors[1];
    button.pressColor = colors[2];
    button.labelMinExtent = new Point(36, 18);
    button.padding = 0;
    button.labelShadowOffset = new Point(-1, -1);
    button.labelShadowColor = colors[1];
    button.labelColor = this.buttonLabelColor;
    button.contrast = this.buttonContrast;
    button.drawNew();
    // button.hint = 'start green\nflag scripts';
    button.fixLayout();
    button.refresh();
    zoomToFitButton = button;
    this.controlBar.add(zoomToFitButton);
    this.controlBar.zoomToFitButton = zoomToFitButton; // for refreshing

    /*
    //steppingButton
    button = new ToggleButtonMorph(
        null, //colors,
        myself, // the IDE is the target
        'toggleSingleStepping',
        [
            new SymbolMorph('footprints', 16),
            new SymbolMorph('footprints', 16)
        ],
        function () {  // query
            return Process.prototype.enableSingleStepping;
        }
    );

    button.corner = 12;
    button.color = colors[0];
    button.highlightColor = colors[1];
    button.pressColor = new Color(153, 255, 213);
//    button.pressColor = colors[2];
    button.labelMinExtent = new Point(36, 18);
    button.padding = 0;
    button.labelShadowOffset = new Point(-1, -1);
    button.labelShadowColor = colors[1];
    button.labelColor = this.buttonLabelColor;
    button.contrast = this.buttonContrast;
    button.drawNew();
    button.hint = 'Visible stepping';
    button.fixLayout();
    button.refresh();
    steppingButton = button;
    this.controlBar.add(steppingButton);
    this.controlBar.steppingButton = steppingButton; // for refreshing
    */

    // stopButton
    button = new ToggleButtonMorph(
        null, // colors
        this, // the IDE is the target
        'stopAllScripts',
        [
            new SymbolMorph('octagon', 14),
            new SymbolMorph('square', 14)
        ],
        function () {  // query
            return myself.stage ?
                    myself.stage.enableCustomHatBlocks &&
                        myself.stage.threads.pauseCustomHatBlocks
                        : true;
        }
    );

    button.corner = 12;
    button.color = colors[0];
    button.highlightColor = colors[1];
    button.pressColor = colors[2];
    button.labelMinExtent = new Point(36, 18);
    button.padding = 0;
    button.labelShadowOffset = new Point(-1, -1);
    button.labelShadowColor = colors[1];
    button.labelColor = new Color(200, 0, 0);
    button.contrast = this.buttonContrast;
    button.drawNew();
    // button.hint = 'stop\nevery-\nthing';
    button.fixLayout();
    button.refresh();
    stopButton = button;
    this.controlBar.add(stopButton);
    this.controlBar.stopButton = stopButton; // for refreshing

    //pauseButton
    button = new ToggleButtonMorph(
        null, //colors,
        myself, // the IDE is the target
        'togglePauseResume',
        [
            new SymbolMorph('pause', 12),
            new SymbolMorph('pointRight', 14)
        ],
        function () {  // query
            return myself.isPaused();
        }
    );

    button.corner = 12;
    button.color = colors[0];
    button.highlightColor = colors[1];
    button.pressColor = colors[2];
    button.labelMinExtent = new Point(36, 18);
    button.padding = 0;
    button.labelShadowOffset = new Point(-1, -1);
    button.labelShadowColor = colors[1];
    button.labelColor = new Color(255, 220, 0);
    button.contrast = this.buttonContrast;
    button.drawNew();
    // button.hint = 'pause/resume\nall scripts';
    button.fixLayout();
    button.refresh();
    pauseButton = button;
    this.controlBar.add(pauseButton);
    this.controlBar.pauseButton = pauseButton; // for refreshing

    // startButton
    button = new PushButtonMorph(
        this,
        'pressStart',
        new SymbolMorph('flag', 14)
    );
    button.corner = 12;
    button.color = colors[0];
    button.highlightColor = colors[1];
    button.pressColor = colors[2];
    button.labelMinExtent = new Point(36, 18);
    button.padding = 0;
    button.labelShadowOffset = new Point(-1, -1);
    button.labelShadowColor = colors[1];
    button.labelColor = new Color(0, 200, 0);
    button.contrast = this.buttonContrast;
    button.drawNew();
    // button.hint = 'start green\nflag scripts';
    button.fixLayout();
    startButton = button;
    this.controlBar.add(startButton);
    this.controlBar.startButton = startButton;
    
    // steppingSlider
    slider = new SliderMorph(
        61,
        1,
        Process.prototype.flashTime * 100 + 1,
        6,
        'horizontal'
    );
    slider.action = function (num) {
        Process.prototype.flashTime = (num - 1) / 100;
        myself.controlBar.refreshResumeSymbol();
    };
    slider.alpha = MorphicPreferences.isFlat ? 0.1 : 0.3;
    slider.setExtent(new Point(50, 14));
    this.controlBar.add(slider);
    this.controlBar.steppingSlider = slider;

    // projectButton
    button = new PushButtonMorph(
        this,
        'projectMenu',
        new SymbolMorph('file', 14)
        //'\u270E'
    );
    button.corner = 12;
    button.color = colors[0];
    button.highlightColor = colors[1];
    button.pressColor = colors[2];
    button.labelMinExtent = new Point(36, 18);
    button.padding = 0;
    button.labelShadowOffset = new Point(-1, -1);
    button.labelShadowColor = colors[1];
    button.labelColor = this.buttonLabelColor;
    button.contrast = this.buttonContrast;
    button.drawNew();
    // button.hint = 'open, save, & annotate project';
    button.fixLayout();
    projectButton = button;
    this.controlBar.add(projectButton);
    this.controlBar.projectButton = projectButton; // for menu positioning

    // settingsButton
    button = new PushButtonMorph(
        this,
        'settingsMenu',
        new SymbolMorph('gears', 14)
        //'\u2699'
    );
    button.corner = 12;
    button.color = colors[0];
    button.highlightColor = colors[1];
    button.pressColor = colors[2];
    button.labelMinExtent = new Point(36, 18);
    button.padding = 0;
    button.labelShadowOffset = new Point(-1, -1);
    button.labelShadowColor = colors[1];
    button.labelColor = this.buttonLabelColor;
    button.contrast = this.buttonContrast;
    button.drawNew();
    // button.hint = 'edit settings';
    button.fixLayout();
    settingsButton = button;
    this.controlBar.add(settingsButton);
    this.controlBar.settingsButton = settingsButton; // for menu positioning


    // settingsButton
    button = new PushButtonMorph(
        this,
        'turtlestitchMenu',
        new SymbolMorph('turtle', 14)
        //new Morph.fromImageURL('stitchcode/assets/turtles.png')
        //'\u2699'
    );
    button.corner = 12;
    button.color = colors[0];
    button.highlightColor = colors[1];
    button.pressColor = colors[2];
    button.labelMinExtent = new Point(36, 18);
    button.padding = 0;
    button.labelShadowOffset = new Point(-1, -1);
    button.labelShadowColor = colors[1];
    button.labelColor = this.buttonLabelColor;
    button.contrast = this.buttonContrast;
    button.drawNew();
    // button.hint = 'edit settings';
    button.fixLayout();
    turtlestitchButton = button;
    this.controlBar.add(turtlestitchButton);
    this.controlBar.turtlestitchButton = turtlestitchButton; // for menu positioning



    this.controlBar.fixLayout = function () {
        x = this.right() - padding;
        [stopButton, pauseButton, startButton].forEach(
            function (button) {
                button.setCenter(myself.controlBar.center());
                button.setRight(x);
                x -= button.width();
                x -= padding;
            }
        );

        x = Math.min(
            startButton.left() - (3 * padding + 2 * stageSizeButton.width()),
            myself.right() - StageMorph.prototype.dimensions.x *
                (myself.isSmallStage ? myself.stageRatio : 1)
        );
        [stageSizeButton, appModeButton, zoomToFitButton].forEach(
            function (button) {
                x += padding;
                button.setCenter(myself.controlBar.center());
                button.setLeft(x);
                x += button.width();
            }
        );

        slider.setCenter(myself.controlBar.center());
        slider.setRight(stageSizeButton.left() - padding);

        //steppingButton.setCenter(myself.controlBar.center());
        //steppingButton.setRight(slider.left() - padding);

        settingsButton.setCenter(myself.controlBar.center());
        settingsButton.setLeft(this.left());

        turtlestitchButton.setCenter(myself.controlBar.center());
        turtlestitchButton.setLeft(settingsButton.right() + padding);

        projectButton.setCenter(myself.controlBar.center());
        projectButton.setRight(settingsButton.left() - padding);

        this.refreshSlider();
        this.updateLabel();
    };

    this.controlBar.refreshSlider = function () {
        if (Process.prototype.enableSingleStepping && !myself.isAppMode) {
            slider.drawNew();
            slider.show();
        } else {
            slider.hide();
        }
        this.refreshResumeSymbol();
    };

    this.controlBar.refreshResumeSymbol = function () {
        var pauseSymbols;
        if (Process.prototype.enableSingleStepping &&
                Process.prototype.flashTime > 0.5) {
            myself.stage.threads.pauseAll(myself.stage);
            pauseSymbols = [
                new SymbolMorph('pause', 12),
                new SymbolMorph('stepForward', 14)
            ];
        } else {
            pauseSymbols = [
                new SymbolMorph('pause', 12),
                new SymbolMorph('pointRight', 14)
            ];
        }
        pauseButton.labelString = pauseSymbols;
        pauseButton.createLabel();
        pauseButton.fixLayout();
        pauseButton.refresh();
    };

    this.controlBar.updateLabel = function () {
        var suffix = myself.world().isDevMode ?
                ' - ' + localize('development mode') : '';

        if (this.label) {
            this.label.destroy();
        }
        if (myself.isAppMode) {
            return;
        }

        this.label = new StringMorph(
            (myself.projectName || localize('untitled')) + suffix,
            14,
            'sans-serif',
            true,
            false,
            false,
            MorphicPreferences.isFlat ? null : new Point(2, 1),
            myself.frameColor.darker(myself.buttonContrast)
        );
        this.label.color = myself.buttonLabelColor;
        this.label.drawNew();
        this.add(this.label);
        this.label.setCenter(this.center());
        this.label.setLeft(this.turtlestitchButton.right() + padding);
    };
};

IDE_Morph.prototype.turtlestitchMenu = function () {
    var menu,
        stage = this.stage,
        world = this.world(),
        myself = this,
        pos = this.controlBar.settingsButton.bottomLeft(),
        shiftClicked = (world.currentKey === 16);

    function addPreference(label, toggle, test, onHint, offHint, hide) {
        var on = '\u2611 ',
            off = '\u2610 ';
        if (!hide || shiftClicked) {
            menu.addItem(
                (test ? on : off) + localize(label),
                toggle,
                test ? onHint : offHint,
                hide ? new Color(100, 0, 0) : null
            );
        }
    }

    menu = new MenuMorph(this);

    //menu.addItem('Units...', 'unitsMenu');
    //menu.addLine();
    addPreference(
        'Display dimension in Inch',
        function () {
            stage.turtleShepherd.toggleMetric();
            stage.scene.grid.draw();
            stage.renderer.changed = true;
            if (!stage.turtleShepherd.isMetric() ) {
                myself.saveSetting('isImperial', true);
            } else {
                myself.removeSetting('isImperial');
            }
        },
        !stage.turtleShepherd.isMetric() ,
        'uncheck to display dimensions in millimeters',
        'check to show dimensions in inch', );

    menu.addLine();
    addPreference(
        'Hide grid',
        function () {
            this.stage.scene.grid.toggle();
            if (StageMorph.prototype.hideGrid) {
                myself.saveSetting('hidegrid', true);
            } else {
                myself.removeSetting('hidegrid');
            }
        },
        StageMorph.prototype.hideGrid,
        'uncheck to show grid',
        'check to hide grid',
    );

    /*
    addPreference(
        'Hide jump stitches',
        function () {
            this.stage.renderer.toggleJumpLines();
            if (StageMorph.prototype.hideJumps) {
                myself.saveSetting('hidejumps', true);
            } else {
                myself.removeSetting('hidejumps');
            }
        },
        StageMorph.prototype.hideJumps ,
        'uncheck to show jump stitches',
        'check to hide jump stitches'
    );
    addPreference(
        'Hide stitch points',
        function () {
            this.stage.renderer.toggleStitchPoints();
            if (StageMorph.prototype.hideStitches) {
                myself.saveSetting('hidestitches', true);
            } else {
                myself.removeSetting('hidestitches');
            }
        },
        StageMorph.prototype.hideStitches,
        'uncheck to show stitch points',
        'check to hide stitch points'
    );
    */
    addPreference(
        'Hide turtle',
        function () {
            this.stage.renderer.toggleTurtle();
            if (StageMorph.prototype.hideTurtle) {
                myself.saveSetting('hideturtle', true);
            } else {
                myself.removeSetting('hideturtle');
            }
        },
        StageMorph.prototype.hideTurtle,
        'uncheck to show turtle',
        'check to hide turtle'
    );
    /*
    addPreference(
        'Ignore embroidery warnings',
        function () {
           this.stage.toggleIgnoreWarnings();
            if (StageMorph.prototype.ignoreWarnings ) {
                myself.saveSetting('ignoreWarning', true);
            } else {
                myself.removeSetting('ignoreWarning');
            }
        },
        StageMorph.prototype.ignoreWarnings ,

        'uncheck to show embroidery specific warnings',
        'check to ignore embroidery specific warnings'
    );
    menu.addLine();
    menu.addItem('Default pen color...', 'userSetPenColor');
    */

    menu.popup(world, pos);
};




IDE_Morph.prototype.toggleAppMode = function (appMode) {
    var world = this.world(),
        elements = [
        this.logo,
        this.controlBar.projectButton,
        this.controlBar.settingsButton,
        this.controlBar.stageSizeButton,
        //this.controlBar.steppingButton,
        this.controlBar.turtlestitchButton,
        //this.controlBar.largeStageSizeButton,
        this.spriteEditor,
        this.paletteHandle,
        this.stageHandle,
        this.palette,
        this.statusDisplay,
        this.categories ];

        this.isAppMode = isNil(appMode) ? !this.isAppMode : appMode;

        Morph.prototype.trackChanges = false;
        if (this.isAppMode) {
            this.setColor(this.appModeColor);
            this.controlBar.setColor(this.color);
            this.controlBar.appModeButton.refresh();
            elements.forEach(function (e) {
                e.hide();
            });
            world.children.forEach(function (morph) {
                if (morph instanceof DialogBoxMorph) {
                    morph.hide();
                }
            });
            this.stage.add(this.controlBar);
			this.controlBar.alpha = 0;
        } else {
			this.controlBar.setColor(this.controlBar.color);
			this.add(this.controlBar);

            elements.forEach(function (e) {
                e.show();
            });
            this.stage.setScale(1);
            // show all hidden dialogs
            world.children.forEach(function (morph) {
                if (morph instanceof DialogBoxMorph) {
                    morph.show();
                }
            });
            // prevent scrollbars from showing when morph appears
            world.allChildren().filter(function (c) {
                return c instanceof ScrollFrameMorph;
            }).forEach(function (s) {
                s.adjustScrollBars();
            });
        }
        this.setExtent(this.world().extent()); // resume trackChanges
};

IDE_Morph.prototype.zoomToFit = function (appMode) {
	this.stage.camera.fitScene();
}


IDE_Morph.prototype.aboutTurtleStitch = function () {
    var dlg, aboutTxt, pic, world = this.world();

    pic = Morph.fromImageURL('stitchcode/assets/turtle-logo.png');
    pic.setExtent(new Point(32, 32));

    aboutTxt = 'TurtleStich! 2.6.2 dev\n\n'
        + 'Copyright \u24B8 2020 Michael Aschauer\n\n'

        + 'TurtleStitch is developed by OSEDA - Association for\n'
        + 'Development of Open Source Software in Education, Design\n'
        + 'and Art and stitchcode.com - Visionary Embroidery.\n\n'

        + 'The project has been sponsored by netidee Open Innovation\n'
        + '(Internet Foundation Austria) and kickstarter crowdfunding.\n\n'

        + 'TurtleStich is based on Snap!\n\n'

        dlg = new DialogBoxMorph();
    dlg.inform(localize('About TurtleStitch'), localize(aboutTxt), world, pic);

    btn1 = dlg.addButton(this.aboutSnap,
        'About Snap!...'
    );
    btn2 = dlg.addButton(
		function () {
            window.open('https://www.turtlestitch.org/', 'TurtleStitchWebsite');
        },
        'TurtleStitch Website',
    );
    dlg.fixLayout();
};

// TurtleCNC addition
//*************************************************************
IDE_Morph.prototype.aboutTurtleCNC = function () {
    var dlg, aboutTxt, pic, world = this.world();

    pic = Morph.fromImageURL('stitchcode/assets/turtle-logo.png');
    pic.setExtent(new Point(32, 32));

    aboutTxt = 'TurtleCNC ' + VERSION + '\n\n'
        + 'Copyright \u24B8 2021 Alex Taylor-Lash\n\n'

        + 'TurtleCNC was developed as part of a Senior Design Thesis\n'
        + 'at Princeton University under the guidance of\n\n'
        + 'Professor Michael Littman\n'

        + 'TurtleCNC is based on TurtleStich, which is based on Snap!\n\n'

        dlg = new DialogBoxMorph();
    dlg.inform(localize('About TurtleStitch'), localize(aboutTxt), world, pic);

    btn1 = dlg.addButton(this.aboutTurtleStitch,
        'About TurtleStitch!...'
    );

    btn2 = dlg.addButton(
		function () {
            window.open(SERVERURL, 'TurtleCNCWebsite');
        },
        'TurtleCNC Website',
    );
    dlg.fixLayout();
};


//*************************************************************


// create status display (inspired by beetleblocks)
IDE_Morph.prototype.createStatusDisplay = function () {
    var frame,
    padding = 1,
    myself = this,
    elements = [],
    stage = this.stage;

    if (this.statusDisplay) {
        this.statusDisplay.destroy();
    }

    this.statusDisplay = new Morph();
    this.statusDisplay.color = this.groupColor;
    this.add(this.statusDisplay);

    frame = new ScrollFrameMorph(null, null, this.sliderColor);
    frame.acceptsDrops = false;
    frame.contents.acceptsDrops = false;

    frame.alpha = 0;

    this.statusDisplay.frame = frame;
    this.statusDisplay.add(frame);

    this.statusDisplay.fixLayout = function () {
        this.setLeft(myself.stage.left());
        this.setTop(myself.stage.bottom() + padding);
        this.setWidth(myself.stage.width());
        this.setHeight(myself.height() - myself.stage.height() - myself.controlBar.height() - padding);
        this.frame.setExtent(this.extent());
        this.arrangeContents();
        this.refresh();
    };

    this.statusDisplay.arrangeContents = function () {
        var x = this.left() + padding,
            y = this.top() + padding,
            max = this.right() - padding,
            start = x,
            middle = (max - start) / 2 + start;

        this.frame.contents.children.forEach(function (element) {
            element.setPosition(new Point(x, y));
            x += element.width();

            if (element instanceof ToggleMorph)
                { x+= element.label.width() + 2; }

            if (element.newLines) {
                y += 14 * element.newLines;
                x = start;
            }

            if (element.newColumn) {
                if (element.columns) {
                    x = ((max - start) / element.columns) * element.newColumn + start;
                } else {
                    x = middle;
                }
            }
        });

        this.frame.contents.adjustBounds();
    };

    this.statusDisplay.addElement = function (element) {

        if (typeof element == 'string') {
            if (element == '-') {
                element = new Morph();
                element.setHeight(1);
                element.setWidth(this.width());
                element.setColor(new Color(200, 200, 200));
                element.newLines = 0.5;
                element.flush = true;
            } else {
                element = new StringMorph(localize(element), 12, null, true);
            }
            if (element.hidden) {
                element.setColor(new Color(0,0,0,0));
            }
        };

        this.frame.contents.add(element);
        this.fixLayout();
    };

    this.statusDisplay.refresh = function () {
        this.frame.contents.children.forEach(function (element) {
            if (element.hasOwnProperty('update')) {
                element.update();
                element.changed();
                element.drawNew();
                element.changed();
            };
        });
    };

    this.statusDisplay.acceptsDrops = function () {
        return false;
    };

    this.statusDisplay.watchers = function (leftPos) {
        /* answer an array of all currently visible watchers.
           If leftPos is specified, filter the list for all
           shown or hidden watchers whose left side equals
           the given border (for automatic positioning) */

        return this.children.filter(function (morph) {
            if (morph instanceof WatcherMorph) {
                if (leftPos) {
                    return morph.left() === leftPos;
                }
                return morph.isVisible;
            }
            return false;
        });
    };

    this.statusDisplay.step = function() {
        // update watchers
        current = Date.now();
        elapsed = current - this.lastWatcherUpdate;
        leftover = (1000 / this.watcherUpdateFrequency) - elapsed;
        if (leftover < 1) {
            this.watchers().forEach(function (w) {
                w.update();
            });
            this.lastWatcherUpdate = Date.now();
        }
    };

    this.statusDisplay.lastWatcherUpdate = Date.now();
    this.statusDisplay.watcherUpdateFrequency = 250;

    var space = new Morph();
    space.alpha = 0;
    space.newLines = 0.5;
    elements.push(space);

    elements.push(' Stitches : ');
    element = new StringMorph();
    element.update = function () {
        this.text = (stage.turtleShepherd.getStepCount()).toString()+ "        ";
    };
    element.columns = 3;
    element.newColumn = 1;
    elements.push(element);


    elements.push('Jumps : ');
    element = new StringMorph();
    element.update = function () {
        this.text = (stage.turtleShepherd.getJumpCount()).toString()+ "        ";
    };
    element.columns = 3;
    element.newColumn = 2;
    elements.push(element);

    elements.push('Size : ');
    element = new StringMorph();
    element.update = function () {
        this.text = (stage.turtleShepherd.getDimensions());
    };
	  element.newLines = 1;
    elements.push(element);
    element.newLines = 1;
    elements.push('-');

    /*
    // too long
    elements.push('  ');
    element = new StringMorph();
    element.color = new Color(255, 0, 0);
    element.update = function () {
        this.text = "" + (stage.turtleShepherd.getTooLongStr());
    };
    element.columns = 2;
    element.newColumn = 1;
    elements.push(element);

     // density warning
    elements.push('');
    element = new StringMorph();
    element.color = new Color(255, 0, 0);
    element.update = function () {
        this.text = "" + (stage.turtleShepherd.getDensityWarningStr());
    };
    element.columns = 2;
    element.newColumn = 2;
    elements.push(element);

     // density warning
    elements.push('');
    element = new StringMorph("");
    element.newLines = 2;
    elements.push(element);
    */

    var zoomInButton = new PushButtonMorph(
            null,
            function () {
                stage.camera.zoomOut();
                stage.renderer.changed = true; },
            '+'
            );
    elements.push(zoomInButton);

    var zoomOutButton = new PushButtonMorph(
            null,
            function () {
                stage.camera.zoomIn();
                stage.renderer.changed = true;
            },
            ' - '
            );
    elements.push(zoomOutButton);

    var resetCameraButton = new PushButtonMorph(
            null,
            function () { stage.camera.reset(); },
            'Reset View'
            );
    elements.push(resetCameraButton);
    resetCameraButton.columns = 4;
    resetCameraButton.newColumn = 2;

    /*
    var XRayButton = new ToggleMorph(
          'checkbox',
          null,
          function () {
            if (stage.isXRay) {
              myself.showMessage("turn off X-RAY ...");
              window.setTimeout(
                function() {
                  stage.turnXRayOff();
                  myself.showMessage("ok.",0.4);
                  myself.XRayButton.refresh();
                }, 250);
            } else {
              myself.showMessage("rendering X-RAY ...");
              window.setTimeout(
                function() {
                  stage.turnXRayOn();
                  myself.showMessage("ok.", 0.4);
                  myself.XRayButton.refresh();
                } ,250);
            }
          },
          'X-Ray',
          function () {
            return stage.getIsXRay();
          });
    elements.push(XRayButton);
    myself.XRayButton = XRayButton;
    XRayButton.columns = 4;
    XRayButton.newColumn = 3;
    */

	var toggleTurboButton = new ToggleMorph(
            'checkbox',
            null,
            function () {
                myself.toggleFastTracking();
            },
            'Turbo mode',
            function () {
                return stage.isFastTracked;
            });
    toggleTurboButton.newLines = 2;
    elements.push(toggleTurboButton);


    var fitScreenButton = new PushButtonMorph(
            null,
            function () { stage.camera.fitScene(); },
            'Zoom to fit'
            );
    elements.push(fitScreenButton);
    fitScreenButton.newLines = 3;

    elements.push('-');

    var downloadGcodeButton = new PushButtonMorph(
        null,
        function () { myself.downloadGcode(); },
        'Export G-Code'
    );
    downloadGcodeButton.columns = 6;
    downloadGcodeButton.newColumn = 2;
    elements.push(downloadGcodeButton);

    /*
    var downloadSVGButton = new PushButtonMorph(
        null,
        function () { myself.downloadSVG(); },
        'Export as SVG'
    );
    downloadSVGButton.columns = 6;
    downloadSVGButton.newColumn = 2;
    elements.push(downloadSVGButton);

	var ignoreColorsButton = new ToggleMorph(
		'checkbox',
		null,
		function () {
			stage.turtleShepherd.toggleIgnoreColors();
		},
		'Ignore colors during export',
		function () {
			return stage.turtleShepherd.getIgnoreColors();
		});

    ignoreColorsButton.newLines = 1.7;
    elements.push(ignoreColorsButton);

    var downloadEXPButton = new PushButtonMorph(
        null,
        function () { myself.downloadEXP(); },
        'Export as Melco/EXP'
    );
    downloadEXPButton.newLines = 1.7;
    elements.push(downloadEXPButton);

    var downloadDSTButton = new PushButtonMorph(
        null,
        function () { myself.downloadDST(); },
        'Export as Tajima/DST'
    );
    downloadDSTButton.newLines = 2.7;
    elements.push(downloadDSTButton);

    if (DEBUG) {
		elements.push(' DEBUG MODE: true');
		element = new StringMorph("");

		element.newLines = 1.2;
		elements.push(element);
		elements.push(' RENDERER: ');
		element = new StringMorph();
		element.update = function () {
			this.text = stage.renderer_status_msg;
		};
		element.newLines = 1;
		elements.push(element);
		elements.push('  ');
	}
    */

    elements.forEach(function(each) { myself.statusDisplay.addElement(each); });
};

// fix layout custom function
IDE_Morph.prototype.fixLayout = function (situation) {
    // situation is a string, i.e.
    // 'selectSprite' or 'refreshPalette' or 'tabEditor'
    var padding = this.padding,
        maxPaletteWidth;

    Morph.prototype.trackChanges = false;

    if (situation !== 'refreshPalette') {
        // controlBar
        this.controlBar.setPosition(this.logo.topRight());
        this.controlBar.setWidth(this.right() - this.controlBar.left());
        this.controlBar.fixLayout();

        // categories
        this.categories.setLeft(this.logo.left());
        this.categories.setTop(this.logo.bottom()+1);
        this.categories.setWidth(this.paletteWidth);
    }

    // palette
    this.palette.setLeft(this.logo.left());
    this.palette.setTop(this.categories.bottom());
    this.palette.setHeight(this.bottom() - this.palette.top());
    this.palette.setWidth(this.paletteWidth);

    if (situation !== 'refreshPalette') {
        // stage
        if (this.isAppMode) {
            this.stage.setScale(this.width() / this.stage.dimensions.x);
            //this.stage.setScale(3);
            this.stage.setCenter(this.center());
            //this.stage.setTop(this.controlBar.bottom());
            //this.stage.setLeft(0);
            this.controlBar.setTop(0);
			this.controlBar.setRight(this.width() - padding);
        } else {
            this.stage.setScale(this.isSmallStage ? this.stageRatio : 1);
            this.stage.setTop(this.logo.bottom() + padding);
            this.stage.setRight(this.right());
            maxPaletteWidth = this.width() -
                this.stage.width() -
                this.spriteBar.tabBar.width() -
                (this.padding * 2);
            if (this.paletteWidth > maxPaletteWidth) {
                this.paletteWidth = maxPaletteWidth;
                this.fixLayout();
            }
            this.stageHandle.fixLayout();
            this.paletteHandle.fixLayout();
        }

        if (this.spriteEditor.isVisible) {
            this.spriteEditor.setLeft(this.paletteWidth + padding);
            this.spriteEditor.setTop(this.logo.bottom() + padding);
            this.spriteEditor.setExtent(new Point(
                //this.spriteBar.width(),
                Math.max(0, this.stage.left() - padding - this.spriteEditor.left()),
                this.bottom() - this.spriteEditor.top()
            ));
        }
        this.statusDisplay.fixLayout();

    }

    Morph.prototype.trackChanges = true;
    this.changed();
};


// G-code export
IDE_Morph.prototype.downloadGcode = function() {
    GcodeStr = this.stage.turtleShepherd.toGcode();
    blob = new Blob([GcodeStr], {type: 'text/plain;charset=utf-8'});
    saveAs(blob, (this.projectName ? this.projectName : 'turtlestitch') + '.gcode');
};

/*
// SVG export
IDE_Morph.prototype.downloadSVG = function() {
    svgStr = this.stage.turtleShepherd.toSVG();
    blob = new Blob([svgStr], {type: 'text/plain;charset=utf-8'});
    saveAs(blob, (this.projectName ? this.projectName : 'turtlestitch') + '.svg');
};

// EXP export
IDE_Morph.prototype.downloadEXP = function() {
    expUintArr = this.stage.turtleShepherd.toEXP();
    blob = new Blob([expUintArr], {type: 'application/octet-stream'});
    saveAs(blob, (this.projectName ? this.projectName : 'turtlestitch') + '.exp');
};

// DST export
IDE_Morph.prototype.downloadDST = function() {
	var name = this.projectName ? this.projectName : 'turtlestitch';
    expUintArr = this.stage.turtleShepherd.toDST(name);
    blob = new Blob([expUintArr], {type: 'application/octet-stream'});
    saveAs(blob, name + '.dst');
};

// PNG export
IDE_Morph.prototype.downloadPNG = function() {
	var name = this.projectName ? this.projectName : 'turtlestitch';

	dataURL = this.stage.turtleShepherd.toPNG(name);
	var binary = atob( dataURL.substr( dataURL.indexOf(',') + 1 ) ),
        i = binary.length,
        view = new Uint8Array(i);

    while (i--) {
        view[i] = binary.charCodeAt(i);
    }

    blob = new Blob([view], {type: 'image/png'});
    saveAs(blob, name + '.png');
};
*/

IDE_Morph.prototype.setProjectName = function (string) {
	if (string.replace(/['"]/g, '') != this.projectName || SnapCloud.username != this.creator) {
		this.remixHistory = this.creator + ":" + this.projectName + ";"  + this.remixHistory
		this.origName =  this.projectName;
	}
	this.origName =  this.projectName;
	this.origCreator =  SnapCloud.username != this.creator ? this.creator : SnapCloud.username;
	this.creator = SnapCloud.username ? SnapCloud.username : "anonymous";
    this.projectName = string.replace(/['"]/g, ''); // filter quotation marks
    this.hasChangedMedia = true;
    this.controlBar.updateLabel();
};



IDE_Morph.prototype.createSpriteBar = function () {
    // assumes that the categories pane has already been created
    var rotationStyleButtons = [],
        thumbSize = new Point(45, 45),
        nameField,
        padlock,
        thumbnail,
        tabCorner = 15,
        tabColors = this.tabColors,
        tabBar = new AlignmentMorph('row', -tabCorner * 2),
        tab,
        symbols = ['\u2192', '\u21BB', '\u2194'],
        labels = ['don\'t rotate', 'can rotate', 'only face left/right'],
        myself = this;

    if (this.spriteBar) {
        this.spriteBar.destroy();
    }

    this.spriteBar = new Morph();
    this.spriteBar.color = this.frameColor;
    //this.add(this.spriteBar);

    function addRotationStyleButton(rotationStyle) {
        var colors = myself.rotationStyleColors,
            button;

        button = new ToggleButtonMorph(
            colors,
            myself, // the IDE is the target
            function () {
                if (myself.currentSprite instanceof SpriteMorph) {
                    myself.currentSprite.rotationStyle = rotationStyle;
                    myself.currentSprite.changed();
                    myself.currentSprite.drawNew();
                    myself.currentSprite.changed();
                }
                rotationStyleButtons.forEach(function (each) {
                    each.refresh();
                });
            },
            symbols[rotationStyle], // label
            function () {  // query
                return myself.currentSprite instanceof SpriteMorph
                    && myself.currentSprite.rotationStyle === rotationStyle;
            },
            null, // environment
            localize(labels[rotationStyle])
        );

        button.corner = 8;
        button.labelMinExtent = new Point(11, 11);
        button.padding = 0;
        button.labelShadowOffset = new Point(-1, -1);
        button.labelShadowColor = colors[1];
        button.labelColor = myself.buttonLabelColor;
        button.fixLayout();
        button.refresh();
        rotationStyleButtons.push(button);
        button.setPosition(myself.spriteBar.position().add(2));
        button.setTop(button.top()
            + ((rotationStyleButtons.length - 1) * (button.height() + 2))
            );
        myself.spriteBar.add(button);
        if (myself.currentSprite instanceof StageMorph) {
            button.hide();
        }
        return button;
    }

    addRotationStyleButton(1);
    addRotationStyleButton(2);
    addRotationStyleButton(0);
    this.rotationStyleButtons = rotationStyleButtons;

    thumbnail = new Morph();
    thumbnail.setExtent(thumbSize);
    thumbnail.image = this.currentSprite.thumbnail(thumbSize);
    thumbnail.setPosition(
        rotationStyleButtons[0].topRight().add(new Point(5, 3))
    );
    this.spriteBar.add(thumbnail);

    thumbnail.fps = 3;

    thumbnail.step = function () {
        if (thumbnail.version !== myself.currentSprite.version) {
            thumbnail.image = myself.currentSprite.thumbnail(thumbSize);
            thumbnail.changed();
            thumbnail.version = myself.currentSprite.version;
        }
    };

    nameField = new InputFieldMorph(this.currentSprite.name);
    nameField.setWidth(100); // fixed dimensions
    nameField.contrast = 90;
    nameField.setPosition(thumbnail.topRight().add(new Point(10, 3)));
    this.spriteBar.add(nameField);
    nameField.drawNew();
    nameField.accept = function () {
        var newName = nameField.getValue();
        myself.currentSprite.setName(
            myself.newSpriteName(newName, myself.currentSprite)
        );
        nameField.setContents(myself.currentSprite.name);
    };
    this.spriteBar.reactToEdit = nameField.accept;

    // padlock
    padlock = new ToggleMorph(
        'checkbox',
        null,
        function () {
            myself.currentSprite.isDraggable =
                !myself.currentSprite.isDraggable;
        },
        localize('draggable'),
        function () {
            return myself.currentSprite.isDraggable;
        }
    );
    padlock.label.isBold = false;
    padlock.label.setColor(this.buttonLabelColor);
    padlock.color = tabColors[2];
    padlock.highlightColor = tabColors[0];
    padlock.pressColor = tabColors[1];

    padlock.tick.shadowOffset = MorphicPreferences.isFlat ?
            new Point() : new Point(-1, -1);
    padlock.tick.shadowColor = new Color(); // black
    padlock.tick.color = this.buttonLabelColor;
    padlock.tick.isBold = false;
    padlock.tick.drawNew();

    padlock.setPosition(nameField.bottomLeft().add(2));
    padlock.drawNew();
    this.spriteBar.add(padlock);
    if (this.currentSprite instanceof StageMorph) {
        padlock.hide();
    }

    // tab bar
    tabBar.tabTo = function (tabString) {
        var active;
        myself.currentTab = tabString;
        this.children.forEach(function (each) {
            each.refresh();
            if (each.state) {active = each; }
        });
        active.refresh(); // needed when programmatically tabbing
        myself.createSpriteEditor();
        myself.fixLayout('tabEditor');
    };

    tab = new TabMorph(
        tabColors,
        null, // target
        function () {tabBar.tabTo('scripts'); },
        localize('Scripts'), // label
        function () {  // query
            return myself.currentTab === 'scripts';
        }
    );
    tab.padding = 3;
    tab.corner = tabCorner;
    tab.edge = 1;
    tab.labelShadowOffset = new Point(-1, -1);
    tab.labelShadowColor = tabColors[1];
    tab.labelColor = this.buttonLabelColor;
    tab.drawNew();
    tab.fixLayout();
    tabBar.add(tab);

    tab = new TabMorph(
        tabColors,
        null, // target
        function () {tabBar.tabTo('costumes'); },
        localize('Costumes'), // label
        function () {  // query
            return myself.currentTab === 'costumes';
        }
    );
    tab.padding = 3;
    tab.corner = tabCorner;
    tab.edge = 1;
    tab.labelShadowOffset = new Point(-1, -1);
    tab.labelShadowColor = tabColors[1];
    tab.labelColor = this.buttonLabelColor;
    tab.drawNew();
    tab.fixLayout();
    tabBar.add(tab);

    tab = new TabMorph(
        tabColors,
        null, // target
        function () {tabBar.tabTo('sounds'); },
        localize('Sounds'), // label
        function () {  // query
            return myself.currentTab === 'sounds';
        }
    );
    tab.padding = 3;
    tab.corner = tabCorner;
    tab.edge = 1;
    tab.labelShadowOffset = new Point(-1, -1);
    tab.labelShadowColor = tabColors[1];
    tab.labelColor = this.buttonLabelColor;
    tab.drawNew();
    tab.fixLayout();
    tabBar.add(tab);

    tabBar.fixLayout();
    tabBar.children.forEach(function (each) {
        each.refresh();
    });
    this.spriteBar.tabBar = tabBar;
    this.spriteBar.add(this.spriteBar.tabBar);

    this.spriteBar.fixLayout = function () {
        this.tabBar.setLeft(this.left());
        this.tabBar.setBottom(this.bottom());
    };
};

IDE_Morph.prototype.createCategories = function () {
    // assumes the logo has already been created
    var myself = this;

    if (this.categories) {
        this.categories.destroy();
    }
    this.categories = new Morph();
    this.categories.color = this.groupColor;
    this.categories.silentSetWidth(this.logo.width()); // width is fixed

    function addCategoryButton(category) {
        var labelWidth = 75,
            colors = [
                myself.frameColor,
                myself.frameColor.darker(50),
                SpriteMorph.prototype.blockColor[category]
            ],
            button;
        
        var catName = category[0].toUpperCase().concat(category.slice(1))
        if (contains(['cnc'], category)) {
                catName = 'CNC';
            }
        
        button = new ToggleButtonMorph(
            colors,
            myself, // the IDE is the target
            function () {
                myself.currentCategory = category;
                myself.categories.children.forEach(function (each) {
                    each.refresh();
                });
                myself.refreshPalette(true);
            },
            catName, // label
            //category[0].toUpperCase().concat(category.slice(1)), // label
            function () {  // query
                return myself.currentCategory === category;
            },
            null, // env
            null, // hint
            null, // template cache
            labelWidth, // minWidth
            true // has preview
        );

        button.corner = 8;
        button.padding = 3;
        button.labelShadowOffset = new Point(-1, -1);
        button.labelShadowColor = colors[1];
        button.labelColor = myself.buttonLabelColor;
        button.fixLayout();
        button.refresh();
        myself.categories.add(button);
        return button;
    }

    function fixCategoriesLayout() {
        var buttonWidth = myself.categories.children[0].width(),
            buttonHeight = myself.categories.children[0].height(),
            border = 3,
            rows =  Math.ceil((myself.categories.children.length) / 2),
            xPadding = (myself.categories.width() -
                border -
                buttonWidth * 2) / 3,
            yPadding = 2,
            l = myself.categories.left(),
            t = myself.categories.top(),
            i = 0,
            row,
            col;

        myself.categories.children.forEach(function (button) {
            i += 1;
            row = Math.ceil(i / 2);
            col = 2 - (i % 2);
            button.setPosition(new Point(
                l + (col * xPadding + ((col - 1) * buttonWidth)),
                t + (row * yPadding + ((row - 1) * buttonHeight) + border)
            ));
        });

        myself.categories.setHeight(
            (rows + 1) * yPadding +
                rows * buttonHeight +
                2 * border
        );
    }

    SpriteMorph.prototype.categories.forEach(function (cat) {
         if (!contains(['asdf','asdf','lists','embroidery','colors','pen'], cat)) {
            addCategoryButton(cat);
        }
    });
    fixCategoriesLayout();
    this.add(this.categories);
};

IDE_Morph.prototype.projectMenu = function () {
    var menu,
        myself = this,
        world = this.world(),
        pos = this.controlBar.projectButton.bottomLeft(),
        graphicsName = this.currentSprite instanceof SpriteMorph ?
                'Costumes' : 'Backgrounds',
        shiftClicked = (world.currentKey === 16);

    // Utility for creating Costumes, etc menus.
    // loadFunction takes in two parameters: a file URL, and a canonical name
    function createMediaMenu(mediaType, loadFunction) {
        return function () {
            var names = this.getMediaList(mediaType),
                mediaMenu = new MenuMorph(
                    myself,
                    localize('Import') + ' ' + localize(mediaType)
                );

            names.forEach(function (item) {
                mediaMenu.addItem(
                    item.name,
                    function () {loadFunction(item.file, item.name); },
                    item.help
                );
            });
            mediaMenu.popup(world, pos);
        };
    }

    menu = new MenuMorph(this);
    menu.addItem('Project notes...', 'editProjectNotes');
    menu.addLine();
    menu.addItem('New', 'createNewProject');
    menu.addItem('Open...', 'openProjectsBrowser');
    menu.addItem(
        'Import...',
        function () {
            var inp = document.createElement('input');
            if (myself.filePicker) {
                document.body.removeChild(myself.filePicker);
                myself.filePicker = null;
            }
            inp.type = 'file';
            inp.style.color = "transparent";
            inp.style.backgroundColor = "transparent";
            inp.style.border = "none";
            inp.style.outline = "none";
            inp.style.position = "absolute";
            inp.style.top = "0px";
            inp.style.left = "0px";
            inp.style.width = "0px";
            inp.style.height = "0px";
            inp.addEventListener(
                "change",
                function () {
                    document.body.removeChild(inp);
                    myself.filePicker = null;
                    world.hand.processDrop(inp.files);
                },
                false
            );
            document.body.appendChild(inp);
            myself.filePicker = inp;
            inp.click();
        },
        'file menu import hint' // looks up the actual text in the translator
    );
    menu.addLine();
    menu.addItem('Save', "save");
    menu.addItem('Save As...', 'saveProjectsBrowser');
    //menu.addItem('Save to Disk', 'saveToDisk');
    menu.addLine();
	menu.addItem(
            'Export as G-code',
            function() { myself.downloadGcode(); },
            'Export current drawing as G-code file'
    );

    menu.addLine();
    if (shiftClicked) {
        menu.addItem(
            'Export all scripts as pic...',
            function () {myself.exportScriptsPicture(); },
            'show a picture of all scripts\nand block definitions',
            new Color(100, 0, 0)
        );
    }
    menu.addItem(
        shiftClicked ?
                'Export project as plain text...' : 'Export project...',
        function () {
            if (myself.projectName) {
                myself.exportProject(myself.projectName, shiftClicked);
            } else {
                myself.prompt('Export Project As...', function (name) {
                    myself.exportProject(name);
                }, null, 'exportProject');
            }
        },
        'show project data as XML\nin a new browser window',
        shiftClicked ? new Color(100, 0, 0) : null
    );

    if (this.stage.globalBlocks.length) {
        menu.addItem(
            'Export blocks...',
            function () {myself.exportGlobalBlocks(); },
            'show global custom block definitions as XML' +
                '\nin a new browser window'
        );
        menu.addItem(
            'Unused blocks...',
            function () {myself.removeUnusedBlocks(); },
            'find unused global custom blocks' +
                '\nand remove their definitions'
        );
    }

    menu.addItem(
        'Export summary...',
        function () {myself.exportProjectSummary(); },
        'open a new browser browser window\n with a summary of this project'
    );
    if (shiftClicked) {
        menu.addItem(
            'Export summary with drop-shadows...',
            function () {myself.exportProjectSummary(true); },
            'open a new browser browser window' +
                '\nwith a summary of this project' +
                '\nwith drop-shadows on all pictures.' +
                '\nnot supported by all browsers',
            new Color(100, 0, 0)
        );
        menu.addItem(
            'Export all scripts as pic...',
            function () {myself.exportScriptsPicture(); },
            'show a picture of all scripts\nand block definitions',
            new Color(100, 0, 0)
        );
    }

    menu.addLine();
    menu.addItem(
        'Import tools',
        function () {
            if (location.protocol === 'file:') {
                myself.importLocalFile();
                return;
            }
            myself.getURL(
                myself.resourceURL('libraries', 'tools.xml'),
                function (txt) {
                    myself.droppedText(txt, 'tools');
                }
            );
        },
        'load the official library of\npowerful blocks'
    );
	menu.addItem(
        'Libraries...',
        function() {
            if (location.protocol === 'file:') {
                myself.importLocalFile();
                return;
            }
            myself.getURL(
                myself.resourceURL('libraries', 'LIBRARIES'),
                function (txt) {
                    var libraries = myself.parseResourceFile(txt);
                    new LibraryImportDialogMorph(myself, libraries).popUp();
                }
            );
        },
        'Select categories of additional blocks to add to this project.'
    );

    menu.addLine();

	if (shiftClicked) {
		menu.addItem(
			'Cloud url...',
			'setCloudURL',
			null,
			new Color(100, 0, 0)
			);
		menu.addLine();
	}
	if (!SnapCloud.username) {
		menu.addItem(
			'Login',
			function () { window.open('/login'); }
			);
		menu.addItem(
			'Create an account',
			function () { window.open('/signup'); }
			);
		menu.addItem(
			'Reset Password...',
			function () { window.open('/forgot_password'); }
			);
	} else {
		menu.addItem(
			localize('Logout') + ' / ' + SnapCloud.username,
			'logout'
		);
	}
    if (shiftClicked) {
        menu.addLine();
        menu.addItem(
            'export project media only...',
            function () {
                if (myself.projectName) {
                    myself.exportProjectMedia(myself.projectName);
                } else {
                    myself.prompt('Export Project As...', function (name) {
                        myself.exportProjectMedia(name);
                    }, null, 'exportProject');
                }
            },
            null,
            this.hasChangedMedia ? new Color(100, 0, 0) : new Color(0, 100, 0)
        );
        menu.addItem(
            'export project without media...',
            function () {
                if (myself.projectName) {
                    myself.exportProjectNoMedia(myself.projectName);
                } else {
                    myself.prompt('Export Project As...', function (name) {
                        myself.exportProjectNoMedia(name);
                    }, null, 'exportProject');
                }
            },
            null,
            new Color(100, 0, 0)
        );
        menu.addItem(
            'export project as cloud data...',
            function () {
                if (myself.projectName) {
                    myself.exportProjectAsCloudData(myself.projectName);
                } else {
                    myself.prompt('Export Project As...', function (name) {
                        myself.exportProjectAsCloudData(name);
                    }, null, 'exportProject');
                }
            },
            null,
            new Color(100, 0, 0)
        );
        /*
        menu.addLine();
        menu.addItem(
            'open shared project from cloud...',
            function () {
                myself.prompt('Author name…', function (usr) {
                    myself.prompt('Project name...', function (prj) {
                        var id = 'Username=' +
                            encodeURIComponent(usr.toLowerCase()) +
                            '&ProjectName=' +
                            encodeURIComponent(prj);
                        myself.showMessage(
                            'Fetching project\nfrom the cloud...'
                        );
                        SnapCloud.getPublicProject(
                            id,
                            function (projectData) {
                                var msg;
                                if (!Process.prototype.isCatchingErrors) {
                                    window.open(
                                        'data:text/xml,' + projectData
                                    );
                                }
                                myself.nextSteps([
                                    function () {
                                        msg = myself.showMessage(
                                            'Opening project...'
                                        );
                                    },
                                    function () {nop(); }, // yield (Chrome)
                                    function () {
                                        myself.rawOpenCloudDataString(
                                            projectData
                                        );
                                    },
                                    function () {
                                        msg.destroy();
                                    }
                                ]);
                            },
                            myself.cloudError()
                        );

                    }, null, 'project');
                }, null, 'project');
            },
            null,
            new Color(100, 0, 0)
        );
        */
    }

    menu.popup(world, pos);
};

IDE_Morph.prototype.snapMenu = function () {
    var menu,
        world = this.world();

    menu = new MenuMorph(this);
    menu.addItem('About TurtleCNC...', 'aboutTurtleCNC');
    menu.addItem('About Snap!...', 'aboutSnap');

    menu.addLine();
    menu.addItem(
        'Reference manual',
        function () {
            window.open('help/SnapManual.pdf', 'SnapReferenceManual');
        }
    );
    menu.addItem(
        'TurtleCNC Web Site <--- Need to link to main server page!!!',
        function () {
            window.open(SERVERURL, 'TurtleCNCWebsite');
        }
    );
    menu.addItem(
        'Snap! website',
        function () {
            window.open('http://snap.berkeley.edu/', 'SnapWebsite');
        }
    );
    menu.addItem(
        'Download source',
        function () {
            window.open(
                'https://github.com/AlexT-L/turtleCNC',
                'TurtleCNCsource'
            );
        }
    );
    if (world.isDevMode) {
        menu.addLine();
        menu.addItem(
            'Switch back to user mode',
            'switchToUserMode',
            'disable deep-Morphic\ncontext menus'
                + '\nand show user-friendly ones',
            new Color(0, 100, 0)
        );
    } else if (world.currentKey === 16) { // shift-click
        menu.addLine();
        menu.addItem(
            'Switch to dev mode',
            'switchToDevMode',
            'enable Morphic\ncontext menus\nand inspectors,'
                + '\nnot user-friendly!',
            new Color(100, 0, 0)
        );
    }
    menu.popup(world, this.logo.bottomLeft());
};


IDE_Morph.prototype.originalCreateSpriteEditor = IDE_Morph.prototype.createSpriteEditor;
IDE_Morph.prototype.createSpriteEditor = function(){
    this.originalCreateSpriteEditor();
    this.spriteEditor.color = new Color(240, 240, 240);
    this.currentSprite.scripts.color = new Color(240, 240, 240);
};

/* CORRAL BAR */
// Single Sprite mode, no corral and no tabs in the scripting area
IDE_Morph.prototype.createCorralBar = nop;
IDE_Morph.prototype.createCorral = nop;

IDE_Morph.prototype.selectSprite = function (sprite) {
    this.currentSprite = sprite;
    this.createPalette();
    this.createSpriteEditor();
    this.fixLayout('selectSprite');
    this.currentSprite.scripts.fixMultiArgs();
};

// Addressing #54: Stage occasionally goes blank
IDE_Morph.prototype.originalRefreshPalette = IDE_Morph.prototype.refreshPalette;
IDE_Morph.prototype.refreshPalette = function (shouldIgnorePosition) {
    this.originalRefreshPalette(shouldIgnorePosition);
    this.stage.reRender();
};

// Language

IDE_Morph.prototype.originalSetLanguage = IDE_Morph.prototype.setLanguage;
IDE_Morph.prototype.setLanguage = function(lang, callback) {
    var myself = this;

    myself.originalSetLanguage(lang, function () {
        var translation = document.getElementById('bb-language'),
            src = 'stitchcode/locales/lang-' + lang + '.js',
            myInnerSelf = this;
        if (translation) {
            document.head.removeChild(translation);
        }
        if (lang === 'en') {
            return this.reflectLanguage('en', callback);
        }
        translation = document.createElement('script');
        translation.id = 'bb-language';
        translation.onload = function () {
            myInnerSelf.reflectLanguage(lang, callback);
        };
        document.head.appendChild(translation);
        translation.src = src;
    });
};


StageHandleMorph.prototype.fixLayout = function () {
    if (!this.target) {return; }
    var ide = this.target.parentThatIsA(IDE_Morph);
    this.setTop(this.target.top() + 10);
    this.setRight(ide.stage.left());

    if (ide) {ide.add(this); } // come to front
};


IDE_Morph.prototype.setStageExtent = function (aPoint) {
    var myself = this,
        world = this.world(),
        ext = aPoint.max(new Point(480, 180));

    function zoom() {
        myself.step = function () {
            var delta = ext.subtract(
                StageMorph.prototype.dimensions
            ).divideBy(2);
            if (delta.abs().lt(new Point(5, 5))) {
                StageMorph.prototype.dimensions = ext;
                delete myself.step;
            } else {
                StageMorph.prototype.dimensions =
                    StageMorph.prototype.dimensions.add(delta);
            }
            myself.stage.setExtent(StageMorph.prototype.dimensions);
            myself.stage.clearPenTrails();
            myself.fixLayout();
            this.setExtent(world.extent());
            this.stage.initCamera();
        };
    }

    this.stageRatio = 1;
    this.isSmallStage = false;
    this.controlBar.stageSizeButton.refresh();
    this.setExtent(world.extent());
    if (this.isAnimating) {
        zoom();
    } else {
        StageMorph.prototype.dimensions = ext;
        this.stage.setExtent(StageMorph.prototype.dimensions);
        this.stage.clearPenTrails();
        this.fixLayout();
        this.setExtent(world.extent());
    }
    this.stage.initCamera();
};


DialogBoxMorph.prototype.promptOrder = function (
    title,
    tosURL,
    tosLabel,
    prvURL,
    prvLabel,
    PUBCheckBoxLabel,
    TOSCheckBoxLabel,
    world,
    pic,
    msg
) {
    var usr = new InputFieldMorph(),
        bmn,
        agreeTOS = true,
        agreePUB = true,
        chk_tos,
        chk_pub,
        mCol = new AlignmentMorph('column', 1),
        yCol = new AlignmentMorph('column', 1),
        lnk = new AlignmentMorph('row', 1),
        bdy = new AlignmentMorph('column', this.padding),
        myself = this;

    function labelText(string) {
        return new TextMorph(
            localize(string),
            10,
            null, // style
            false, // bold
            null, // italic
            null, // alignment
            null, // width
            null, // font name
            MorphicPreferences.isFlat ? null : new Point(1, 1),
            new Color(255, 255, 255) // shadowColor
        );
    }

    function linkButton(label, url) {
        var btn = new PushButtonMorph(
            myself,
            function () {
                window.open(url);
            },
            '  ' + localize(label) + '  '
        );
        btn.fontSize = 10;
        btn.corner = myself.buttonCorner;
        btn.edge = myself.buttonEdge;
        btn.outline = myself.buttonOutline;
        btn.outlineColor = myself.buttonOutlineColor;
        btn.outlineGradient = myself.buttonOutlineGradient;
        btn.padding = myself.buttonPadding;
        btn.contrast = myself.buttonContrast;
        btn.drawNew();
        btn.fixLayout();
        return btn;
    }


    bdy.setColor(this.color);

    mCol.alignment = 'left';
    mCol.setColor(this.color);
    yCol.alignment = 'left';
    yCol.setColor(this.color);


    if (msg) {
        bdy.add(labelText(msg));
    }

    if (tosURL || prvURL) {
        bdy.add(lnk);
    }
    if (tosURL) {
        lnk.add(linkButton(tosLabel, tosURL));
    }
    if (prvURL) {
        lnk.add(linkButton(prvLabel, prvURL));
    }

    if (PUBCheckBoxLabel) {
        chk_pub = new ToggleMorph(
            'checkbox',
            this,
            function () {agreePUB = !agreePUB; }, // action,
            PUBCheckBoxLabel,
            function () {return agreePUB; } //query
        );
        chk_pub.edge = this.buttonEdge / 2;
        chk_pub.outline = this.buttonOutline / 2;
        chk_pub.outlineColor = this.buttonOutlineColor;
        chk_pub.outlineGradient = this.buttonOutlineGradient;
        chk_pub.contrast = this.buttonContrast;
        chk_pub.drawNew();
        chk_pub.fixLayout();
        bdy.add(chk_pub);
    }

    if (TOSCheckBoxLabel) {
        chk_tos = new ToggleMorph(
            'checkbox',
            this,
            function () {agreeTOS = !agreeTOS; }, // action,
            TOSCheckBoxLabel,
            function () {return agreeTOS; } //query
        );
        chk_tos.edge = this.buttonEdge / 2;
        chk_tos.outline = this.buttonOutline / 2;
        chk_tos.outlineColor = this.buttonOutlineColor;
        chk_tos.outlineGradient = this.buttonOutlineGradient;
        chk_tos.contrast = this.buttonContrast;
        chk_tos.drawNew();
        chk_tos.fixLayout();
        bdy.add(chk_tos);
    }


    mCol.fixLayout();
    yCol.fixLayout();
    lnk.fixLayout();
    bdy.fixLayout();

    this.labelString = title;
    this.createLabel();
    if (pic) {this.setPicture(pic); }

    this.addBody(bdy);

    mCol.drawNew();
    yCol.drawNew();
    bdy.fixLayout();

    this.addButton('ok', 'OK');
    this.addButton('cancel', 'Cancel');
    this.fixLayout();
    this.drawNew();
    this.fixLayout();

    function validInputs() {

        function indicate(morph, string) {
            var bubble = new SpeechBubbleMorph(localize(string));
            bubble.isPointingRight = false;
            bubble.drawNew();
            bubble.popUp(
                world,
                morph.leftCenter().subtract(new Point(bubble.width() + 2, 0))
            );
            if (morph.edit) {
                morph.edit();
            }
        }


		if (!agreeTOS) {
			indicate(chk_tos, 'please agree to\nthe TOS');
			return false;
		}
		return true;
    }

    this.accept = function () {
        if (validInputs()) {
            DialogBoxMorph.prototype.accept.call(myself);
        }
    };


    this.getInput = function () {
        return {
            choice_pub: agreePUB
        };
    };

    this.reactToChoice = function () {
    };

    this.reactToChoice(); // initialize e-mail label

    if (!this.key) {
        this.key = 'order';
    }

    this.popUp(world);
};


IDE_Morph.prototype.uploadOrder = function () {
    var myself = this,
        world = this.world();

    if (window.location.hostname.endsWith("localhost")) {
		 SHOP_URL = 'http://shop.stitchcode.localhost/ext.php';
	} else {
		SHOP_URL = 'http://shop.stitchcode.com/ext.php';
	}

	if (myself.stage.turtleShepherd.hasSteps()) {
		new DialogBoxMorph(
			this,
			function(userdata) {
				expUintArr = this.stage.turtleShepherd.toDST();
				blob_dst = new Blob([expUintArr], {type: 'application/octet-stream'});
				expUintArr = this.stage.turtleShepherd.toEXP();
				blob_exp = new Blob([expUintArr], {type: 'application/octet-stream'});

				var fd = new FormData;
				var name = (this.projectName ? this.projectName : 'turtlestitch')
				fd.append('public', userdata.choice_pub);
				fd.append('filename', name + ".dst");
				fd.append('projectname', name);
				fd.append('source', 'turtlestitch');
				fd.append('url', window.location.href);
				fd.append('dstfile', blob_dst, name + ".dst");
				fd.append('expfile', blob_exp, name + ".exp");
				if (SnapCloud.username)
					fd.append('username', SnapCloud.username);

				var request = new XMLHttpRequest();

				request.onreadystatechange = function () {
					if (request.readyState === 4) {
						if (request.responseText) {
							try {
								var response = JSON.parse(request.responseText);
								if (!response.error) {
									new  DialogBoxMorph().informWithLink(
									'Upload success',
									'Your embroidery was successully uploaded.\n\n Procceed to order opening a new window.\n'
									+ 'If it does not open automatically, click here:' ,
									response.url,
									world);
									window.open(response.url);
								}
							} catch(e) {
								new  DialogBoxMorph().inform(
									'Upload Error',
									'Sorry. There was an Error during upload: \n' + request.responseText,
									world);
							}


						} else {
							new  DialogBoxMorph().inform(
								'Upload Error',
								'Sorry. There was an Error during upload: \n'
								+ request.responseText + "\n"
								+ request.status + ' - ' + request.statusText,
								world);
						}
					}
				};

				//url = url + ((/\?x=/).test(url) ? "&" : "?") + (new Date()).getTime();
				request.open('POST', SHOP_URL, true);
				request.send(fd);
			}, // fntion
			this
		).promptOrder(
			'Upload Order',
			'http://snap.berkeley.edu/tos.html',
			'Terms of Service...',
			'',
			'',
			'Upload project as public (domain)',
			'I have read and agree\nto the Terms of Service',
			world,
			null, //new SymbolMorph("turtle"), //icon
			null // msg
		);
	} else {
		new  DialogBoxMorph().inform(
			'Upload Error',
			'No stitches to upload, please (re)generate a drawing first!',
			world);
	}
};

DialogBoxMorph.prototype.informWithLink = function (
    title,
    textString,
    url,
    world,
    pic
) {
	var lnk = new AlignmentMorph('row', 1);
    var txt = new TextMorph(
			textString,
			this.fontSize,
			this.fontStyle,
			true,
			false,
			'center',
			null,
			null,
			MorphicPreferences.isFlat ? null : new Point(1, 1),
			new Color(255, 255, 255)
		),
	  bdy = new AlignmentMorph('column', this.padding),
      myself = this;

	function linkButton(label, url) {
        var btn = new PushButtonMorph(
            myself,
            function () {
                window.open(url);
            },
            '  ' + localize(label) + '  '
        );
        btn.fontSize = 10;
        btn.corner = myself.buttonCorner;
        btn.edge = myself.buttonEdge;
        btn.outline = myself.buttonOutline;
        btn.outlineColor = myself.buttonOutlineColor;
        btn.outlineGradient = myself.buttonOutlineGradient;
        btn.padding = myself.buttonPadding;
        btn.contrast = myself.buttonContrast;
        btn.drawNew();
        btn.fixLayout();
        return btn;
    }

    if (!this.key) {
        this.key = 'inform' + title + textString;
    }

    this.labelString = title;
    this.createLabel();
    if (pic) {this.setPicture(pic); }

    if (textString) {
         bdy.add(txt)
    }

    if (url) {
		lnk.add(linkButton(url, url));
		bdy.add(lnk);
	}

	bdy.fixLayout();

	this.addBody(bdy);

    this.addButton('ok', 'OK');
    this.drawNew();
    this.fixLayout();
    this.popUp(world);
};



ProjectDialogMorph.prototype.installCloudProjectList = function (pl) {
    var myself = this;
    this.projectList = pl || [];
    this.projectList.sort(function (x, y) {
        return x.ProjectName.toLowerCase() < y.ProjectName.toLowerCase() ?
                 -1 : 1;
    });

    this.listField.destroy();
    this.listField = new ListMorph(
        this.projectList,
        this.projectList.length > 0 ?
                function (element) {
                    return element.ProjectName || element;
                } : null,
        [ // format: display shared project names bold
            [
                'bold',
                function (proj) {return proj.Public === 'true'; }
            ]
        ],
        function () {myself.ok(); }
    );
    this.fixListFieldItemColors();
    this.listField.fixLayout = nop;
    this.listField.edge = InputFieldMorph.prototype.edge;
    this.listField.fontSize = InputFieldMorph.prototype.fontSize;
    this.listField.typeInPadding = InputFieldMorph.prototype.typeInPadding;
    this.listField.contrast = InputFieldMorph.prototype.contrast;
    this.listField.drawNew = InputFieldMorph.prototype.drawNew;
    this.listField.drawRectBorder = InputFieldMorph.prototype.drawRectBorder;

    this.listField.action = function (item) {
        if (item === undefined) {return; }
        if (myself.nameField) {
            myself.nameField.setContents(item.ProjectName || '');
        }
        if (myself.task === 'open') {
            myself.notesText.text = item.Notes || '';
            myself.notesText.drawNew();
            myself.notesField.contents.adjustBounds();
            myself.preview.texture = item.Thumbnail || null;
            myself.preview.cachedTexture = null;
            myself.preview.drawNew();
            (new SpeechBubbleMorph(new TextMorph(
                localize('last changed') + '\n' + item.Updated,
                null,
                null,
                null,
                null,
                'center'
            ))).popUp(
                myself.world(),
                myself.preview.rightCenter().add(new Point(2, 0))
            );
        }
        if (item.Public === 'true') {
            myself.shareButton.hide();
            myself.unshareButton.show();
        } else {
            myself.unshareButton.hide();
            myself.shareButton.show();
        }
        myself.buttons.fixLayout();
        myself.fixLayout();
        myself.edit();
    };
    this.body.add(this.listField);
    this.shareButton.show();
    this.unshareButton.hide();
    this.deleteButton.show();
    this.buttons.fixLayout();
    this.fixLayout();
    if (this.task === 'open') {
        this.clearDetails();
    }
};


ProjectDialogMorph.prototype.fixLayoutOrig = ProjectDialogMorph.prototype.fixLayout;
ProjectDialogMorph.prototype.buildContentsOrig = ProjectDialogMorph.prototype.buildContents;
ProjectDialogMorph.prototype.initOrig = ProjectDialogMorph.prototype.init;
ProjectDialogMorph.prototype.saveProjectOrig = ProjectDialogMorph.prototype.saveProject;

ProjectDialogMorph.prototype.buildContents = function () {
    this.buildContentsOrig();
    this.tagsLabelField = new TextMorph("Tags (New cloud projects only):");
    this.body.add(this.tagsLabelField);
    this.notesLabelField = new TextMorph("Notes");
    this.notesLabelField.edge = InputFieldMorph.prototype.edge;
    this.body.add(this.notesLabelField);
    this.tagsField = new InputFieldMorph("");
    this.tagsField.edge = InputFieldMorph.prototype.edge;
    this.tagsField.contrast = InputFieldMorph.prototype.contrast;
    this.tagsField.drawNew = InputFieldMorph.prototype.drawNew;
    this.body.add(this.tagsField);
	this.fixLayout();
};

ProjectDialogMorph.prototype.fixLayout = function () {
	this.fixLayoutOrig();
    var th = fontHeight(this.titleFontSize) + this.titlePadding * 2,
        thin = this.padding / 2,
        oldFlag = Morph.prototype.trackChanges;

	if (this.body && this.tagsField) {
		this.notesLabelField.setTop(this.preview.bottom() + thin);
        this.notesLabelField.setLeft(this.preview.left() + 1);

        this.notesField.setTop(this.notesLabelField.bottom());
        this.notesField.setLeft(this.preview.left());
        this.notesField.setHeight(this.body.bottom() - this.notesLabelField.bottom() - this.notesLabelField.height() - thin);

		this.tagsLabelField.setTop(this.notesField.bottom() + thin);
        this.tagsLabelField.setLeft(this.notesField.left()  + 1);

		this.tagsField.setTop(this.notesField.bottom() + 2);
        this.tagsField.setLeft(this.tagsLabelField.right());
        this.tagsField.setWidth(this.notesField.width() -  this.tagsLabelField.width() - 1);


    }
    this.changed();
}


ProjectDialogMorph.prototype.init = function (ide, task) {
	this.initOrig (ide, task);
	this.tagsText = "Tags?";
}

ProjectDialogMorph.prototype.saveProjectOrig = ProjectDialogMorph.prototype.saveProject;
ProjectDialogMorph.prototype.saveProject = function () {
	this.ide.tags = this.tagsField.contents().text.text;
	console.log(this.ide.tags);

    this.saveProjectOrig();
};

StageMorph.prototype.backgroundColor = new Color(255,255,255);
StageMorph.prototype.defaultPenColor = new Color(0,0,0,1);

/*
IDE_Morph.prototype.userSetBackgroundColor = function () {
    new DialogBoxMorph(
        this,
        function (value) {
            this.stage.renderer.setBackgroundColorHex(value);
            if (value != '#ffffff')
              this.saveSetting('backgroundColor', value);
            else {
                this.removeSetting('backgroundColor');
            }
        },
        this
    ).prompt(
        "Default background color",
        new String("#" + ((1 << 24)
          + (Math.round(StageMorph.prototype.backgroundColor.r) << 16)
          + (Math.round(StageMorph.prototype.backgroundColor.g) << 8)
      	  + Math.round(StageMorph.prototype.backgroundColor.b)).toString(16).slice(1)),
        this.world(),
        null, // pic
        null, // choices
        null, // read only
        false // numeric
    );
};
*/

/*
IDE_Morph.prototype.userSetPenColor = function () {
    new DialogBoxMorph(
        this,
        function (value) {
            this.stage.renderer.setDefaultPenColorHex(value);
            this.currentSprite.setColor(StageMorph.prototype.defaultPenColor);
            if (value != '#000000')
              this.saveSetting('defaultPenColor', value);
            else {
                this.removeSetting('defaultPenColor');
            }
        },
        this
    ).prompt(
        "Default pen color",
        new String("#" + ((1 << 24)
          + (Math.round(StageMorph.prototype.defaultPenColor.r) << 16)
          + (Math.round(StageMorph.prototype.defaultPenColor.g) << 8)
      	  + Math.round(StageMorph.prototype.defaultPenColor.b)).toString(16).slice(1)),
        this.world(),
        null, // pic
        null, // choices
        null, // read only
        false // numeric
    );
};
*/

// CNC additions
ProjectDialogMorph.prototype.getCNCExamplesProjectList = function () {
    return this.ide.getMediaList('stitchcode/Examples');
};
