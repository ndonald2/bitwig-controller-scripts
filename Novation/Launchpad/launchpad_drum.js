/*
 * DRUM PAGE
 *
 * */

drumPage = new Page();

// Sets button 5 on top to on, allows scrolling up and down drums and then draws pads
drumPage.updateOutputState = function()
{
   clear();
   this.updateScrollButtons();
       setTopLED(5, Colour.AMBER_FULL);

   this.canScrollUp = drumScroll < 115;
   this.canScrollDown = drumScroll > 5;

   this.drawPads();
};

drumPage.onSceneButton = function(row, isPressed)
{
};

drumPage.onLeft = function(isPressed)
{
};

drumPage.onRight = function(isPressed)
{
};

drumPage.onUp = function(isPressed)
{
   seqPage.onUp(isPressed);
};

drumPage.onDown = function(isPressed)
{
   seqPage.onDown(isPressed);
};

// Detects the presses and plays the appropiate notes and the key and velocity
drumPage.onGridButton = function(row, column, pressed)
{
   if (!pressed) return;

   var cx = column >> 1;
   var cy = row >> 1;

   var fx = column & 1;
   var fy = row & 1;

   var velocity = (fx + fy << 1) << 5;

   var key = gridToKey(cx, cy);
   cursorTrack.playNote(key, velocity);
};

// Draws the sections in a 4x4 pattern on the pads
drumPage.drawPads = function()
{
   if (activePage != drumPage) return;

   for(var x=0; x<4; x++)
   {
      for(var y=0; y<4; y++)
      {
         var key = gridToKey(x, y);

         var even = ((x + y) & 1) == 0;
         var colour = even ? Colour.RED_LOW : Colour.AMBER_LOW;

         if (noteOn[key])
         {
            colour = Colour.GREEN_FULL;
         }

         setCellLED(x*2, y*2, colour);
         setCellLED(x*2+1, y*2, colour);
         setCellLED(x*2, y*2+1, colour);
         setCellLED(x*2+1, y*2+1, colour);
      }
   }
};
