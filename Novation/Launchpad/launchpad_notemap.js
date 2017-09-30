/*
 * Note map
 *
 * */
 
 // Makes up all the Notemaps to be used within launchpad_keys.js

function NoteMap()
{
   this.rootKey = 36;
}

NoteMap.prototype.cellToKey = function(x, y)
{
   // -1 means no key (gap)
   return -1;
};

NoteMap.prototype.cellToVelocity = function(x, y)
{
    return 90;
};

function isKeyBlack(key)
{
    var k = key % 12;

    switch (k)
    {
        case 1:
        case 3:
        case 6:
        case 8:
        case 10:
            return true;
    }

    return false;
}

NoteMap.prototype.keyIsBlack = function(key)
{
   return isKeyBlack(key);
};

NoteMap.prototype.drawCell = function(x, y, highlight)
{
   var key = this.cellToKey(x, y);

   // sets the colours of the black and white keys
   var white = highlight ? Colour.AMBER_FULL : Colour.AMBER_LOW;
   var black = highlight ? Colour.RED_FULL : Colour.RED_LOW;

   var colour = (key != -1) ? (this.keyIsBlack(key) ? black : white) : Colour.OFF;

   if (noteOn[key])
   {
      colour = Colour.GREEN_FULL;
   }

   setCellLED(x, y, colour);
};

NoteMap.prototype.canScrollUp = function()
{
   return false;
};

NoteMap.prototype.canScrollDown = function()
{
   return false;
};

NoteMap.prototype.canScrollLeft = function()
{
   return false;
};

NoteMap.prototype.canScrollRight = function()
{
   return false;
};

//----------------------------------------------------------------------------------------------------------

smallDrumNoteMap = new NoteMap();

smallDrumNoteMap.cellToKey = function(x, y)
{
   var subX = x & 3;
   var subY = y & 3;
   var page = (y < 4 ? 2 : 0) + (x >= 4 ? 1 : 0);

   return this.rootKey + (3 - subY) * 4 + subX + 16 * page;
};

smallDrumNoteMap.keyIsBlack = function(key)
{
    var s = key & 1 != 0;
    return key & 4 ? !s : s;
};

smallDrumNoteMap.scrollUp = function()
{
   this.rootKey = Math.min(this.rootKey + 16, 60);
   updateNoteTranlationTable();
};

smallDrumNoteMap.scrollDown = function()
{
   this.rootKey = Math.max(this.rootKey - 16, 4);
   updateNoteTranlationTable();
};

smallDrumNoteMap.canScrollUp = function()
{
   return this.rootKey < 60;
};

smallDrumNoteMap.canScrollDown = function()
{
   return this.rootKey  > 4;
};

smallDrumNoteMap.canScrollLeft = function()
{
   return true;
};

smallDrumNoteMap.scrollLeft = function()
{
   activeNoteMap = largeDrumNoteMap;
   updateNoteTranlationTable();
};

smallDrumNoteMap.mixerButton = function()
{
};

smallDrumNoteMap.getName = function()
{
   return "Drums (small)";
}

//----------------------------------------------------------------------------------------------------------

largeDrumNoteMap = new NoteMap();

largeDrumNoteMap.cellToKey = function(x, y)
{
    var lx = x >> 1;
    var ly = y >> 1;
    return this.rootKey + (3 - ly) * 4 + lx;
};

largeDrumNoteMap.keyIsBlack = function(key)
{
    var s = key & 1 != 0;
    return key & 4 ? !s : s;
};

largeDrumNoteMap.scrollUp = function()
{
   this.rootKey = Math.min(this.rootKey + 16, 108);
   updateNoteTranlationTable();
};

largeDrumNoteMap.scrollDown = function()
{
   this.rootKey = Math.max(this.rootKey - 16, 0);
   updateNoteTranlationTable();
};

largeDrumNoteMap.canScrollUp = function()
{
   return this.rootKey < 108;
};

largeDrumNoteMap.canScrollDown = function()
{
   return this.rootKey  > 4;
};

largeDrumNoteMap.canScrollRight = function()
{
   return true;
};

largeDrumNoteMap.scrollRight = function()
{
   activeNoteMap = smallDrumNoteMap;
   updateNoteTranlationTable();
};

largeDrumNoteMap.mixerButton = function()
{
};

largeDrumNoteMap.getName = function()
{
   return "Drums (large)";
}

//----------------------------------------------------------------------------------------------------------

LinearGridNoteMap.prototype = new NoteMap();
LinearGridNoteMap.prototype.constructor = LinearGridNoteMap;

function LinearGridNoteMap(stepsX, stepY)
{
    NoteMap.call(this);
    this.stepsX = stepsX;
    this.stepY = stepY;
}

LinearGridNoteMap.prototype.getName = function()
{
   return "Linear";
}

LinearGridNoteMap.prototype.xToOffset = function(x)
{
   var o = 0;

   for(var i=0; i<x; i++)
   {
      o += this.stepsX[i % this.stepsX.length];
   }
   return o;
};

LinearGridNoteMap.prototype.cellToKey = function(x, y)
{
   var key = this.rootKey + (7-y)*this.stepY + this.xToOffset(x);

   if (key >= 0 && key < 128)
   {
      return key;
   }

   return -1;
};

LinearGridNoteMap.prototype.scrollUp = function()
{
   this.rootKey = Math.min(this.rootKey + 16, 108);
   updateNoteTranlationTable();
};

LinearGridNoteMap.prototype.scrollDown = function()
{
   this.rootKey = Math.max(this.rootKey - 16, 4);
   updateNoteTranlationTable();
};

LinearGridNoteMap.prototype.canScrollUp = function()
{
   return this.rootKey < 108;
};

LinearGridNoteMap.prototype.canScrollDown = function()
{
   return this.rootKey  > 4;
};

LinearGridNoteMap.mixerButton = function()
{
};

LinearGridNoteMap.prototype.getName = function()
{
   return "Linear";
}

//----------------------------------------------------------------------------------------------------------

pianoNoteMap = new NoteMap();

pianoNoteMap.cellToKey = function(x, y)
{
   var octave = 3 - Math.floor(y / 2);

   var xx = 0;
   var no_k = false;

   switch(x)
   {
      case 0:
         xx = 0;
         no_k = true;
         break;

      case 1:
         xx = 2;
         break;

      case 2:
         xx = 4;
         break;

      case 3:
         xx = 5;
         no_k = true;
         break;

      case 4:
         xx = 7;
         break;

      case 5:
         xx = 9;
         break;

      case 6:
         xx = 11;
         break;

      case 7:
         xx = 12;
         no_k = true;
         break;
   }

   var white = y & 1 != 0;

   if (!white && no_k)
   {
      return -1;
   }

   var key = this.rootKey + octave * 12 + xx;

   if (!white)
   {
      key -= 1;
   }

   return key;
};

pianoNoteMap.scrollUp = function()
{
   this.rootKey = Math.min(this.rootKey + 12, 108);
   updateNoteTranlationTable();
};

pianoNoteMap.scrollDown = function()
{
   this.rootKey = Math.max(this.rootKey - 12, 0);
   updateNoteTranlationTable();
};

//these next 2 functions were added to get rid of the error
pianoNoteMap.scrollLeft = function()
{
};

pianoNoteMap.scrollRight = function()
{
};



pianoNoteMap.canScrollUp = function()
{
   return this.rootKey < 108;
};

pianoNoteMap.canScrollDown = function()
{
   return this.rootKey > 0;
};

pianoNoteMap.mixerButton = function()
{
};

pianoNoteMap.getName = function()
{
   return "Piano";
}

//----------------------------------------------------------------------------------------------------------

var ModernModes =
[
   [0, 2, 4, 5, 7, 9, 11, 12],  // Ionian
   [0, 2, 3, 5, 7, 9, 10, 12],  // Dorian
   [0, 1, 3, 5, 7, 8, 10, 12],  // Phrygian
   [0, 2, 4, 6, 7, 9, 11, 12],  // Lydian
   [0, 2, 4, 5, 7, 9, 11, 12],  // Mixolydian
   [0, 2, 3, 5, 7, 8, 10, 12],  // Aeolian
   [0, 1, 3, 5, 6, 8, 10, 12]   // Locrian
];

var ModernModesNames =
[
  ['Ionian (Major)'],
  ['Dorian'],
  ['Phrygian'],
  ['Lydian'],
  ['Mixolydian'],
  ['Aeolian (Natural minor scale)'],
  ['Locrian']

];

var RootNoteNames = 

[
  ['C'],
  ['C#'],
  ['D'],
  ['D# / Eb'],
  ['E'],
  ['F'],
  ['F#'],
  ['G'],
  ['G#'],
  ['A'],
  ['A# / Bb'],
  ['B']
];

diatonicNoteMap = new NoteMap();
diatonicNoteMap.mode = 0;
diatonicNoteMap.root = 0;

diatonicNoteMap.cellToKey = function(x, y)
{
   var octave = 7-y;
   var key = this.rootKey + octave * 12 + ModernModes[this.mode][x];

   if (key >= 0 && key < 128)
   {
      return key;
   }

   return -1;
}

diatonicNoteMap.scrollUp = function()
{
   this.rootKey = Math.min(this.rootKey + 12, 72);
   updateNoteTranlationTable();
};

diatonicNoteMap.scrollDown = function()
{
   this.rootKey = Math.max(this.rootKey - 12, 0);
   updateNoteTranlationTable();
};

diatonicNoteMap.scrollLeft = function()
{
	if(this.root > 0)
	{
		this.rootKey = this.rootKey - 1;
	}
	this.root = Math.max(0, this.root - 1);
   //this.mode = Math.max(0, this.mode - 1);
   updateNoteTranlationTable();
   host.showPopupNotification("Root: " + RootNoteNames[this.root] + " | Mode: " + ModernModesNames[this.mode]);
};

diatonicNoteMap.scrollRight = function()
{
	if(this.root < 11)
	{
		this.rootKey = this.rootKey + 1;
	}
	this.root = Math.min(11, this.root + 1);
   //this.mode = Math.min(ModernModes.length - 1, this.mode + 1);
   updateNoteTranlationTable();
   host.showPopupNotification("Root: " + RootNoteNames[this.root] + " | Mode: " + ModernModesNames[this.mode]);
};

diatonicNoteMap.canScrollUp = function()
{
   return this.rootKey < 72;
};

diatonicNoteMap.canScrollDown = function()
{
   return this.rootKey > 0;
};

diatonicNoteMap.canScrollLeft = function()
{
   return this.root > 0;
};

diatonicNoteMap.canScrollRight = function()
{
   return (this.root + 1) < RootNoteNames.length;
};

diatonicNoteMap.mixerButton = function()
{
   if (this.mode == ModernModes.length - 1)
   {
		this.mode = 0;
   }
   else
   {
		this.mode = this.mode + 1;
   }
   updateNoteTranlationTable();
   host.showPopupNotification("Root: " + RootNoteNames[this.root] + " | Mode: " + ModernModesNames[this.mode]);
};

diatonicNoteMap.getName = function()
{
   return "Diatonic";
}

//----------------------------------------------------------------------------------------------------------

var linear34Grid = new LinearGridNoteMap([3], 4);
var linear25Grid = new LinearGridNoteMap([2], 5);
var linear14Grid = new LinearGridNoteMap([1], 4);
var noteMap23_12 = new LinearGridNoteMap([2, 3], 6);
var noteMap13_12 = new LinearGridNoteMap([1, 3], 6);

//----------------------------------------------------------------------------------------------------------

linear14Grid.canScrollRight = function()
{
   return true;
};

linear14Grid.scrollRight = function()
{
   activeNoteMap = linear34Grid;
   updateNoteTranlationTable();
};

linear34Grid.canScrollLeft = function()
{
   return true;
};

linear34Grid.scrollLeft = function()
{
   activeNoteMap = linear14Grid;
   updateNoteTranlationTable();
};

linear34Grid.canScrollRight = function()
{
   return true;
};

linear34Grid.scrollRight = function()
{
   activeNoteMap = linear25Grid;
   updateNoteTranlationTable();
};

linear25Grid.canScrollLeft = function()
{
   return true;
};

linear25Grid.scrollLeft = function()
{
   activeNoteMap = linear34Grid;
   updateNoteTranlationTable();
};

linear25Grid.mixerButton = function()
{
};

//----------------------------------------------------------------------------------------------------------

var noteMaps = [pianoNoteMap, largeDrumNoteMap, diatonicNoteMap, linear14Grid, null, null, null, null];

var activeNoteMap = pianoNoteMap;
