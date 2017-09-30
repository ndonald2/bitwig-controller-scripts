
/*
 * STEP SEQUENCER PAGE
 *
 * */

seqPage = new Page();

var SEQ_BUFFER_STEPS = 256;

var STEP_SIZE =
{
   STEP_1_4 : 0,
   STEP_1_8 : 1,
   STEP_1_16 : 2,
   STEP_1_32 : 3
};

function stepSizeName(s)
{
   switch (s)
   {
      case STEP_SIZE.STEP_1_4:
         return "1/4";
      case STEP_SIZE.STEP_1_8:
         return "1/8";
      case STEP_SIZE.STEP_1_16:
         return "1/16";
      case STEP_SIZE.STEP_1_32:
         return "1/32";
   }
   return "";
}

seqPage.title = "Step Sequencer";
seqPage.key = 36;
seqPage.velocityStep = 2;
seqPage.velocity = velocities[seqPage.velocityStep];

seqPage.stepSet = initArray(false, 128*SEQ_BUFFER_STEPS);

seqPage.detailMode = false;

seqPage.activeStep = 0;
seqPage.playingStep = -1;

seqPage.stepSize = STEP_SIZE.STEP_1_16;

seqPage.onShift = function(isPressed)
{
   if (isPressed)
   {
      this.detailMode = !this.detailMode;
      host.showPopupNotification(this.detailMode ? "Set notes for step" : "Set steps for note");
   }
}

seqPage.viewOffset = function()
{
	var x = Math.max(0,seqPage.playingStep) & 0xffffffe0;
	
	return Math.min(x, SEQ_BUFFER_STEPS - 32);
}

seqPage.updateOutputState = function()
{
   clear();
   this.canScrollUp = activeNoteMap.canScrollUp();
   this.canScrollDown = activeNoteMap.canScrollDown();
   this.updateScrollButtons();
   setTopLED(6, Colour.YELLOW_FULL);
   setTopLED(7, this.detailMode ? Colour.RED_FULL : Colour.RED_LOW);

   this.drawSequencer();
};

seqPage.onSceneButton = function(row, isPressed)
{
   if (isPressed)
   {
      if (row >= 4)
      {
         this.setVelocity(row - 4);
      }
      else
      {
         this.stepSize = row;

         host.showPopupNotification("Step size: " + stepSizeName(this.stepSize));

         var stepInBeatTime = Math.pow(0.5, this.stepSize);
         cursorClip.setStepSize(stepInBeatTime);
      }
   }
};

seqPage.setVelocity = function(step)
{
   this.velocityStep = step;
   this.velocity = velocities[step];

   if(userVelNote == true){
		cursorTrack.playNote(this.key, this.velocity);
	};
   updateVelocityTranslationTable();
   host.showPopupNotification("Velocity: " + this.velocity);
};

seqPage.onLeft = function(isPressed)
{
};

seqPage.onRight = function(isPressed)
{
};

seqPage.onUp = function(isPressed)
{
   if (isPressed)
   {
      activeNoteMap.scrollUp();
   }
};

seqPage.onDown = function(isPressed)
{
   if (isPressed)
   {
      activeNoteMap.scrollDown();
   }
};

seqPage.onGridButton = function(row, column, pressed)
{
   if (row < 4)
   {
      if (pressed)
      {
         var step = column + 8*row + this.viewOffset();
         if (this.detailMode)
         {
            this.activeStep = step;
         }
         else
         {
            cursorClip.toggleStep(step, this.key, this.velocity);
         }
      }
   }
   else
   {
      var key = activeNoteMap.cellToKey(column, row);

      if (key >= 0)
      {
         var velocity = 90;

         if (pressed)
         {
            //cursorTrack.startNote(key, velocity);

            if (this.detailMode)
            {
               cursorClip.toggleStep(this.activeStep, key, this.velocity);
            }
            else
            {
               this.setKey(key);
            }
         }
         else
         {
            //cursorTrack.stopNote(key, velocity);
         }
      }
   }
};

function gridToKey(x, y)
{
   return (3 - y) * 4 + x + drumScroll;
}

seqPage.shouldKeyBeUsedForNoteInport = function(x,y)
{
   return y >= 4;
}

seqPage.setKey = function(key)
{
   seqPage.key = key;

   //cursorClip.scrollToKey(key);
};

seqPage.onStepExists = function(column, row, state)
{
   seqPage.stepSet[column*128 + row] = state;
};

seqPage.onStepPlay = function(step)
{
   seqPage.playingStep = step;
};

seqPage.onNotePlay = function(isOn, key, velocity)
{
   noteOn[key] = isOn;
};

seqPage.hasAnyKey = function(step)
{
   for(var i=0; i<128; i++)
   {
      if (this.stepSet[step * 128 + i])
      {
         return true;
      }
   }

   return false;
};

seqPage.drawSequencer = function()
{
   for(var y=0; y<4; y++)
   {
      for(var x=0; x<8; x++)
      {
         var index = y*8 + x + this.viewOffset();

         var isSet = this.detailMode ? this.hasAnyKey(index) : this.stepSet[index * 128 + this.key];
         var isPlaying = index == this.playingStep;

         var colour = isSet ?
            (isPlaying ? Colour.GREEN_FULL : Colour.AMBER_FULL) :
            (isPlaying ? Colour.GREEN_LOW : Colour.OFF);

         if (this.detailMode && index == this.activeStep)
         {
            colour = Colour.GREEN_FULL;
         }

         setCellLED(x, y, colour);
      }
   }

   for(var i=0; i<4; i++)
   {
      setRightLED(i, seqPage.stepSize == i ? Colour.GREEN_FULL : Colour.GREEN_LOW);
      setRightLED(4 + i, seqPage.velocityStep == i ? Colour.AMBER_FULL : Colour.AMBER_LOW);
   }

   for(var x=0; x<8; x++)
   {
      for(var y=4; y<8; y++)
      {
         var key = activeNoteMap.cellToKey(x, y);
         var isActive = this.detailMode
            ? this.stepSet[this.activeStep * 128 + key]
            : key == this.key;

         activeNoteMap.drawCell(x, y, isActive);
      }
   }
};
