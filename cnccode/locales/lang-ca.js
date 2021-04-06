
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
    'Sobre Snap!...',
  'About TurtleStitch...':
    'Sobre TurtleStitch!...',
  'About TurtleStitch':
    'Sobre TurtleStitch',
  ' Stitches : ':
    ' Puntades : ',
  'Jumps':
    'Salts',
  'Jumps : ':
    'Salts : ',
  'Stitchpoints':
    'Punts',
  'Grid':
    'Graella',
  'Reset View':
    'Restableix la vista',
  'Zoom to fit':
    'Zoom per adaptar-se',
  'zoom to fit':
    'zoom per adaptar-se',
  'Size : ':
    'Mida : ',
  'Imperial units':
    'Unitats angleses',
  'Turtle':
    'Tortuga',
  'Login':
    'Inicia la sessió',
  'Create an account':
    'Registra\u0027t',
  'Reset Password...':
    'Recupera la contrasenya',
  'Export as SVG':
    'Exportar a SVG',
  'Export as PNG':
    'Exportar a PNG',
  'Export as Melco/EXP':
    'Exportar a Melco/EXP',
  'Export as Tajima/DST':
    'Exportar a Tajima/DST',
  'Export current drawing as SVG Vector file':
    'Exportar diseny actual a arxiu vectorial SVG',
  'Export current drawing as EXP/Melco Embroidery file':
    'Exportar diseny actual a arxiu de brodat EXP/Melco',
  'Export current drawing as DST/Tajima Embroidery file':
    'Exportar diseny actual a arxiu de brodat Tajima/DST',
  'Export to Embroidery service':
    'Export a un servei de brodat',
  'Export to cnccode.com\'s embroidery service':
    'Exportar al servei de brodat cnccode.com',
  'Ignore colors during export':
    'Ignorar els colors a l\u0027exportar',
  'X-Ray':
    'Radiografia',
  'Import tools':
    'Importa eines',
  'load the official library of powerful blocks':
    'carrega la llibreria oficial de blocks potents', 
  
  // settings
  'Units..':
    'Unitats...',
  'Display dimension in Inch':
    'Mostrar dimensions en polzades',
  'Hide grid':
    'Amagar quadrícula',
  'Hide turtle':
    'Amagar tortuga',
  'Hide jump stitches':
    'Amagar puntades de salt',
  'Hide stitch points':
    'Amagar punts de puntada',
  'Ignore embroidery warnings':
    'Ignorar advertències de brodat',
  'uncheck to show embroidery specific warnings':
    'desmarqueu per mostrar advertències específiques de brodat',
  'check to ignore embroidery specific warnings':
    'marqueu per ignorar advertències específiques de brodat',
  'uncheck to show grid':
    'desmarqueu per mostrar la quadrícula',
  'check to hide grid':
    'marqueu per amagar la quadrícula',
  'uncheck to show jump stitches':
    'desmarqueu per mostrar les puntades de salt',
  'check to hide jump stitches':
    'marqueu per amagar les puntades de salt',
  'uncheck to show stitch points':
    'desmarqueu per mostrar punts de puntada',
  'check to hide stitch points':
    'marqueu per amagar punts de puntada',
  'uncheck to show turtle':
    'desmarqueu per mostrar la tortuga',
  'check to hide turtle':
    'marqueu per amagar la tortuga',
  'uncheck to display dimensions in millimeters':
    'desmarqueu per mostrar les dimensions en mil·límetres',
  'check to show dimensions in inch':
    'marqueu per mostrar dimensions en polzades',
  'Default background color':
    'Color de fons per defecte',
  'Default pen color':
    'Color de llapis per defecte',
  'Default background color...':
    'Color de fons per defecte...',
  'Default pen color...':
    'Color de llapis per defecte...',

  // legacy blocks
  'clear':
    'neteja',
  'move %n steps by %n steps':
    'mou-te %n passos amb %n salts',
  'move %n steps in %n':
    'mou-te %n passos en %n puntades',
  'go to x: %n y: %n by %n':
    'vés a x: %n y: %n amb %n salts ',
  'go to x: %n y: %n in %n':
    'vés a x: %n y: %n in %n puntades',

  // new blocks
  'point towards x: %n y: %n':
    'apunta a x: %n y: %n',
  'reset':
    'restableix',

  // warnings
  ' are too long! (will get clamped)':
    'són massa llarges! (es fixaran)',
  ' is too long! (will get clamped)':
    'és massa llarga! (es fixarà)',

  // pen and color setting
  'pen size':
    'mida del llapis',
  'pen down?':
    'llapis baixat?',
  'RGB color':
    'color RGB',
  'hex color':
    'color hexadecimal',
  'HSV color':
    'color HSV',
  'set color to %clr':
    'assigna color a %clr',
  'set color to RGB %n %n %n':
    'assigna color RGB %n %n %n',
  'set color to HSV %n %n %n':
    'assigna color HSV %n %n %n',
  'set color to hex %s':
    'assigna color hexadecimal %s',
  'set color by hue %huewheel':
    'assigna color per tonalitat %huewheel',
  'set %hsb to %n':
    'assigna %hsb a %n',
  'change %hsb by %n':
    'augmenta %hsb en %n',
  'color: %hsb':
    'color: %hsb',
  'opacity':
    'opacitat',
  'set opacity to %n':
    'assigna opacitat %n',
  'change opacity by %n':
    'aumenta opacitat en %n',
  'hue':
    'matís',
  'brightness':
    'brillantor',
  'augmentar matís en %n':
    '\u00e4ndere Farbton um %n',

  // new categories
  'Embroidery':
    'Brodat',
  'Colors':
    'Colors',

  // embroidery blocks and stuff
  'running stitch by %n steps':
    'executa puntada en %n passos',
  'triple run by %n':
    'puntada triple en %n passos',
  'cross stitch in %n by %n center %b':
    'puntada de creu %n vegades %n centrat %b',
  'zigzag with density %n width %n center %b':
    'zig-zag amb densitat %n amplada %n centrat %b',
  'Z-stitch with density %n width %n center %b':
    'puntada Z amb densitat %n amplada %n centrat %b',
  'satin stitch with width %n center %b':
    'puntada de setí d\u0027amplada %n centrat %b',
  'tatami stitch width %n interval %n center %b':
    'puntada de tatami amb amplada %n interval %n centrat %b',
  'jump stitch %b':
    'puntada de salt %b',
  'tie stitch':
    'puntada de corbata',
  'trim':
    'talla',
  'stop running':
    'aturar brodat',
  'draw text %s with size %n':
    'escriu %s amb mida %n',
  'text length of %s with size %n':
    'longitud de %s de mida %n',
  'rendering X-RAY ...':
    'renderitzant radiografia ...',
  'turn off X-RAY ...':
    'desactivar radiografia ...',
};

// Add attributes to original SnapTranslator.dict.de
for (var attrname in tempDict) { SnapTranslator.dict.ca[attrname] = tempDict[attrname]; }
