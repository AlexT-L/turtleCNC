
/*
    Special characters: (see <http://0xcc.net/jsescape/>)

    Ä, ä   \u00c4, \u00e4
    Ö, ö   \u00d6, \u00f6
    Ü, ü   \u00dc, \u00fc
    ß      \u00df
*/

tempDict = {

  // UI strings
  'About Snap!...':
    'Over Snap!...',
  'About TurtleStitch...':
    'Over TurtleStitch …',
  'About TurtleStitch':
    ' Over TurtleStitch',
  ' Stitches : ':
    ' Steken : ',
  'Jumps':
    'Springsteken',
  'Jumps : ':
    'Springsteken : ',
  'Stitchpoints':
    'Borduurpunten',
  'Grid':
    'Raster',
  'Reset View':
    'Weergave wissen',
  'Zoom to fit':
    'Passend zoomen',
  'zoom to fit':
    'passend zoomen',
  'Size : ':
    'Grootte : ',
  'Imperial units':
    'Brits-Amerikaanse eenheden',
  'Turtle':
    'Schildpad',
  'Login':
    'Log in',
  'Create an account':
    'Account aanmaken',
  'Reset Password...':
    'Wachtwoord opnieuw instellen',
  'Export as SVG':
    'Exporteren als SVG vectorafbeelding',
  'Export as PNG':
    'Exporteren als PNG',
  'Export as Melco/EXP':
    'Exporteren als Melco/EXP',
  'Export as Tajima/DST':
    'Exporteren als Tajima/DST',
  'Export current drawing as SVG Vector file':
    'Exporteer huidige afbeelding als SVG vectorafbeelding',
    'Export current drawing as EXP/Melco Embroidery file':
    'Exporteer huidige afbeelding als borduurbestand in EXP/Melco format',
  'Export current drawing as DST/Tajima Embroidery file':
    'Exporteer huidige afbeelding als borduurbestand in Tajima/DST format',
  'Export to Embroidery service':
    'Exporteren naar borduurservice',
  'Export to cnccode.com\'s embroidery service':
    'Exporteer huidige afbeelding naar borduurservice cnccode.com',
  'Ignore colors during export':
    'Negeer kleuren bij export',
  'X-Ray':
    'R\u00f6ntgenfoto',

  // settings
  'Units..':
    'Eenheden …',
  'Display dimension in Inch':
    'Maten weergeven in inches',
  'Hide grid':
    'Raster verbergen',
  'Hide turtle':
    'Schildpad verbergen',
  'Hide jump stitches':
    'Springsteken niet tonen',
  'Hide stitch points':
    'Steken verbergen',
  'Ignore embroidery warnings':
    'Negeer waarschuwingen over borduren',
  'uncheck to show embroidery specific warnings':
    'vink uit om borduu waarschuwingen te tonen',
  'check to ignore embroidery specific warnings':
    'vink aan om borduurwaarschuwingen te verbergen',
  'uncheck to show grid':
    'vink uit om raster te tonen',
  'check to hide grid':
    'vink aan om raster te verbergen',
  'uncheck to show jump stitches':
    'vink uit om springsteken te tonen',
  'check to hide jump stitches':
    'vink aan om springsteken te verbergen',
  'uncheck to show stitch points':
    'vink uit om steken te tonen',
  'check to hide stitch points':
    'vink aan om steken te verbergen',
  'uncheck to show turtle':
    'vink uit um Schildpad te tonen',
  'check to hide turtle':
    'vink aan um Schildpad te verbergen',
  'uncheck to display dimensions in millimeters':
    'vink uit om maten in millimeters te tonen',
  'check to show dimensions in inch':
    'vink aan om maten in inches te tonen',
  'Default background color':
    'Standaard achtergrondkleur',
  'Default pen color':
    'Standaard penkleur',
  'Default background color...':
    'Standaard achtergrondkleur …',
  'Default pen color...':
    'Standaard penkleur …',

  // legacy blocks
  'clear':
    'wissen',
  'move %n steps by %n steps':
    'neem %n stappen in steken van %n',
  'move %n steps in %n':
    'neem %n stappen in %n steken',
  'go to x: %n y: %n by %n':
    'ga naar x: %n y: %n in steken van %n',
  'go to x: %n y: %n in %n':
    'ga naar x: %n y: %n in %n steken',

  // new blocks
  'point towards x: %n y: %n':
    'richt naar x: %n y: %n',
  'reset':
    'reset',

  // warnings
  ' are too long! (will get clamped)':
    'zijn te lang! (worden geklemd)',
  ' is too long! (will get clamped)':
    'is te lang! (wordt geklemd)',

  // pen and color setting
  'pen size':
    'pendikte',
  'pen down?':
    'pen neer?',
  'RGB color':
    'RGB kleur',
  'hex color':
    'kleur in hex',
  'HSV color':
    'HSV kleur',
  'set color to %clr':
    'maak kleur %clr',
  'set color to RGB %n %n %n':
    'maak kleur RGB %n %n %n',
  'set color to HSV %n %n %n':
    'maak kleur HSV %n %n %n',
  'set color to hex %s':
    'maak kleur hex %s',
  'set color by hue %huewheel':
    'maak kleurtint %huewheel',
  'set %hsb to %n':
    'stel %hsb in op %n',
  'change %hsb by %n':
    'verander %hsb met %n',
  'color: %hsb':
    'kleur: %hsb',
  'opacity':
    'ondoorschijnendheid',
  'set opacity to %n':
    'maak ondoorschijnendheid %n',
  'change opacity by %n':
    'verander ondoorschijnendheid met %n',
  'hue':
    'tint (hue)',
  'brightness':
    'helderheid',
  'change hue by %n':
    'verander tint (hue) met %n',

  // new categories
  'Embroidery':
    'Borduren',
  'Colors':
    'Kleuren',

  // embroidery blocks and stuff
  'running stitch by %n steps':
    'lijnsteek met steeklengte %n',
  'triple run by %n':
    'drievoudige lijnsteek met steeklengte %n',
  'cross stitch in %n by %n center %b':
    'kruissteek van %n bij %n gecentreerd %b',
  'zigzag with density %n width %n center %b':
    'zigzag met dichtheid %n breedte %n gecentreerd %b',
  'Z-stitch with density %n width %n center %b':
    'Z-steek met dichtheid %n breedte %n gecentreerd %b',
  'satin stitch with width %n center %b':
    'satijnsteek met breedte %n gecentreerd %b',
  'tatami stitch width %n interval %n center %b':
    'Tatami-steek met breedte %n interval %n gecentreerd %b',
  'jump stitch %b':
    'springsteek %b',
  'tie stitch':
    'knoopsteek',
  'trim':
    'knip af',
  'stop running':
    'verwijder borduurinstellingen',
  'draw text %s with size %n':
    'schrijf tekst %s met grootte %n',
  'text length of %s with size %n':
    'lengte van tekst %s met grootte %n',
  'rendering X-RAY ...':
    'R\u00f6ntgenfoto maken ...',
  'turn off X-RAY ...':
    'verwijder R\u00f6ntgenfoto ...',
};

// Add attributes to original SnapTranslator.dict.de
for (var attrname in tempDict) { SnapTranslator.dict.nl[attrname] = tempDict[attrname]; }
