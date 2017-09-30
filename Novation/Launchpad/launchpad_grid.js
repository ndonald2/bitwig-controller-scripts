
/*
*  GRID PAGE
*
* */

gridPage = new Page();

gridPage.mixerAlignedGrid = false;
gridPage.canScrollTracksUp = false;
gridPage.canScrollTracksDown = false;
gridPage.canScrollScenesUp = false;
gridPage.canScrollScenesDown = false;
gridPage.title = "Clip Launcher";

// Updates the scroll buttons
gridPage.updateOutputState = function()
{
   clear();

   this.canScrollUp = this.mixerAlignedGrid ? this.canScrollScenesUp : this.canScrollTracksUp;
   this.canScrollDown = this.mixerAlignedGrid ? this.canScrollScenesDown : this.canScrollTracksDown;
   this.canScrollLeft = !this.mixerAlignedGrid ? this.canScrollScenesUp : this.canScrollTracksUp;
   this.canScrollRight = !this.mixerAlignedGrid ? this.canScrollScenesDown : this.canScrollTracksDown;

   this.updateScrollButtons();
   this.updateGrid();

   // Set the top LED while in Clip Launcher
   setTopLED(4,
      TEMPMODE == TempMode.SCENE
         ? Colour.GREEN_FULL
         : (TEMPMODE == TempMode.OFF
         ? Colour.YELLOW_FULL
         : Colour.OFF));

   /*setTopLED(7,
      TEMPMODE == TempMode.TRACK
         ? Colour.GREEN_FULL
         : Colour.OFF);*/

	// Set the top LED of Mixer red when mixer alligned
   setTopLED(7, this.mixerAlignedGrid ? Colour.RED_FULL : Colour.RED_LOW);
};

// This detects when the Mixer button is pressed and changes the orientation identifier mixerAlignedGrid and displays the text popup
gridPage.onShift = function(isPressed)
{
   if (isPressed)
   {
      this.mixerAlignedGrid = !this.mixerAlignedGrid;
	  if(this.mixerAlignedGrid){
		application.setPerspective('MIX');
		}
	  if(this.mixerAlignedGrid == false){
	  	application.setPerspective('ARRANGE');
		}
      //this.setTempMode(TempMode.TRACK);
      host.showPopupNotification("Orientation: " + (this.mixerAlignedGrid ? "Mix" : "Arranger"));
   }
   else
   {
      //this.setTempMode(TempMode.OFF);
   }
}

// This detects when one of the vertical buttons is pressed and changes the TempMode
gridPage.onSceneButton = function(row, isPressed)
{
   if (isPressed)
   {
      switch(row)
      {
         case MixerButton.VOLUME:
            this.setTempMode(TempMode.VOLUME);
            break;

         case MixerButton.PAN:
            this.setTempMode(TempMode.PAN);
            break;

         case MixerButton.SEND_A:
            this.setTempMode(TempMode.SEND_A);
            break;

         case MixerButton.SEND_B:
            this.setTempMode(TempMode.SEND_B);
            break;

         case MixerButton.STOP:
            this.setTempMode(TempMode.USER1);
            break;

         case MixerButton.TRK_ON:
            this.setTempMode(TempMode.USER2);
            break;

         case MixerButton.SOLO:
            this.setTempMode(TempMode.USER3);
            break;

         case MixerButton.ARM:
            this.setTempMode(TempMode.TRACK);
            break;
      }
   }
   else
   {
      this.setTempMode(TempMode.OFF);
   }
};

// These following 4 functions control the scrolling arrow buttons allowing move around
gridPage.onLeft = function(isPressed)
{
   if (isPressed)
   {
      if (this.mixerAlignedGrid) trackBank.scrollTracksUp();
      else trackBank.scrollScenesUp();
   }
};

gridPage.onRight = function(isPressed)
{
   if (isPressed)
   {
      if (this.mixerAlignedGrid) trackBank.scrollTracksDown();
      else trackBank.scrollScenesDown();
   }
};

gridPage.onUp = function(isPressed)
{
   if (isPressed)
   {
      if (this.mixerAlignedGrid) trackBank.scrollScenesUp();
      else trackBank.scrollTracksUp();
   }
};

gridPage.onDown = function(isPressed)
{
   if (isPressed)
   {
      if (this.mixerAlignedGrid) trackBank.scrollScenesDown();
      else{
		trackBank.scrollTracksDown();
	  }
   }
};

gridPage.onGridButton = function(row, column, pressed)
{
   if (!pressed) return;

   if (TEMPMODE === TempMode.SCENE)
   {
      trackBank.launchScene(this.mixerAlignedGrid ? row : column);
   }
   else if (TEMPMODE === TempMode.OFF)
   {
      var track = this.mixerAlignedGrid ? column : row;
      var scene = this.mixerAlignedGrid ? row : column;

      if (IS_RECORD_PRESSED)
      {
         trackBank.getTrack(track).getClipLauncher().record(scene);
      }
      else if (IS_EDIT_PRESSED)
      {
         trackBank.getTrack(track).getClipLauncher().showInEditor(scene);
      }
      else
      {
         trackBank.getTrack(track).getClipLauncher().launch(scene);
      }
   }
   else if (TEMPMODE === TempMode.TRACK)
   {
	
	  var track = this.mixerAlignedGrid ? column : row;
      var scene = this.mixerAlignedGrid ? row-2 : column;
	
	 if (this.mixerAlignedGrid == false) {
      switch(scene)
		  {
			 case TrackModeColumn.STOP:
				trackBank.getTrack(track).getClipLauncher().stop();
				break;

			 case TrackModeColumn.SELECT:
				trackBank.getTrack(track).select();
				break;

			 case TrackModeColumn.ARM:
				trackBank.getTrack(track).getArm().toggle();
				break;
				
			 case TrackModeColumn.SOLO:
				trackBank.getTrack(track).getSolo().toggle();
				break;
				
			 case TrackModeColumn.MUTE:
				trackBank.getTrack(track).getMute().toggle();
				break;

			 case TrackModeColumn.RETURN_TO_ARRANGEMENT:
				trackBank.getTrack(track).getClipLauncher().returnToArrangement();
				break;
		  }
	 }
	 else {
		  switch(scene)
		  {
		  	 case TrackModeColumn.RETURN_TO_ARRANGEMENT-9:
				trackBank.getTrack(track).getClipLauncher().returnToArrangement();
				break;
				
			 case TrackModeColumn.SELECT:
				trackBank.getTrack(track).select();
				break;

			 case TrackModeColumn.ARM:
				trackBank.getTrack(track).getArm().toggle();
				break;
				
			 case TrackModeColumn.SOLO:
				trackBank.getTrack(track).getSolo().toggle();
				break;
				
			 case TrackModeColumn.MUTE:
				trackBank.getTrack(track).getMute().toggle();
				break;
			
			 case TrackModeColumn.STOP+5:
				trackBank.getTrack(track).getClipLauncher().stop();
				break;

		  }
	 }	  
	  

   }
   // setups the buttons functionality (not the colors) for all the Vol, Pan, Sends and user pages.
   else
   {
      switch(TEMPMODE)
      {
         case TempMode.VOLUME:
            trackBank.getTrack(this.mixerAlignedGrid ? column : row).getVolume().set(this.mixerAlignedGrid ? -Math.abs(row)+7 : column, 8);
            break;

         case TempMode.PAN:
            trackBank.getTrack(this.mixerAlignedGrid ? column : row).getPan().set(this.mixerAlignedGrid ? -Math.abs(row)+7 : column, userVarPans);
            break;

         case TempMode.SEND_A:
            trackBank.getTrack(this.mixerAlignedGrid ? column : row).getSend(0).set(this.mixerAlignedGrid ? -Math.abs(row)+7 : column, 8);
            break;

         case TempMode.SEND_B:
            trackBank.getTrack(this.mixerAlignedGrid ? column : row).getSend(1).set(this.mixerAlignedGrid ? -Math.abs(row)+7 : column, 8);
            break;

         case TempMode.USER1:
            userControls.getControl(this.mixerAlignedGrid ? column : row).set(this.mixerAlignedGrid ? -Math.abs(row)+7 : column, 8);
            break;

         case TempMode.USER2:
            userControls.getControl(this.mixerAlignedGrid ? column : row + 8).set(this.mixerAlignedGrid ? -Math.abs(row + 8)+7 : column, 8);
            break;

         case TempMode.USER3:
            userControls.getControl(this.mixerAlignedGrid ? column : row + 16).set(this.mixerAlignedGrid ? -Math.abs(row + 16)+7 : column, 8);
            break;
      }
   }
};

// updates the grid and VUmeters
gridPage.updateGrid = function()
{
   for(var t=0; t<8; t++)
   {
      this.updateTrackValue(t);
      this.updateVuMeter(t);
   }
};

// sets the colours for the VUmeters
// calls the mixColour function within the launchpad_constants.js script
function vuLevelColor(level)
{
   switch (level)
   {
      case 1:
         return mixColour(0, 1, false);

      case 2:
         return mixColour(0, 2, false);

      case 3:
         return mixColour(0, 3, false);

      case 4:
         return mixColour(2, 3, false);

      case 5:
         return mixColour(3, 3, false);

      case 6:
         return mixColour(3, 2, false);

      case 7:
         return mixColour(3, 0, false);
   }

   return Colour.OFF;
}

// even though this section is called updateVumeter, it also setups the colours of all side buttons when they are pressed
gridPage.updateVuMeter = function(track)
{
   var val = vuMeter[track];
   var colour = Colour.OFF;

   if (this.mixerAlignedGrid)
   {
      var i = 7 - track;
      colour = masterVuMeter > i ? vuLevelColor(Math.max(1, i)) : Colour.OFF;
   }
   else
   {
      colour = vuLevelColor(val);
   }
	// Sets the colours of all the right hand side buttons when they are pressed.
   switch(TEMPMODE)
   {
      case TempMode.VOLUME:
         if (track === 0) colour = Colour.GREEN_FULL;
         break;

      case TempMode.PAN:
         if (track === 1) colour = Colour.AMBER_FULL;
         break;

      case TempMode.SEND_A:
         if (track === 2) colour = Colour.YELLOW_FULL;
         break;

      case TempMode.SEND_B:
         if (track === 3) colour = Colour.YELLOW_FULL;
         break;

      case TempMode.USER1:
         if (track === 4) colour = Colour.GREEN_FULL;
         break;

      case TempMode.USER2:
         if (track === 5) colour = Colour.GREEN_FULL;
         break;

      case TempMode.USER3:
         if (track === 6) colour = Colour.GREEN_FULL;
         break;

      case TempMode.TRACK:
         if (track === 7) colour = Colour.ORANGE;
         break;
   }

   setRightLED(track, colour);
};



gridPage.updateTrackValue = function(track)
{
   if (activePage != gridPage) return;
	// this section draws the pads for the main clip launcher
   if (TEMPMODE == TempMode.OFF || TEMPMODE == TempMode.SCENE)
   {
      for(var scene=0; scene<8; scene++)
      {
         var i = track + scene*8;

         var col = arm[track] ? Colour.RED_LOW : Colour.OFF;
		 
         var fullval = mute[track] ? 1 : 3;
		 
         if (hasContent[i] > 0)
         {
            if (isQueued[i] > 0)
            {
               col = mixColour(0, fullval, true);
            }
            else if (isRecording[i] > 0)
            {
               col = Colour.RED_FULL;
            }
            else if (isPlaying[i] > 0)
            {
               col = mixColour(0, fullval, false);
            }
            else
            {
               col = mixColour(fullval, fullval, false);
            }
         }

         setCellLED(this.mixerAlignedGrid ? track : scene, this.mixerAlignedGrid ? scene : track, col);
      }
   }
	// this sets the buttons and lights for the solo/mute/arm track page. The variable TrackModeColumn is set in the main Launchpad script, so reordering them doesn't work.
   else if (TEMPMODE == TempMode.TRACK)
   {
	 if (this.mixerAlignedGrid == false) {
		  for(var scene=5; scene<8; scene++)
		  {
			 setCellLED(scene, track, Colour.OFF);
		  }

		  if (trackExists[track])
		  {
			 setCellLED(TrackModeColumn.STOP, track, Colour.OFF);
			 setCellLED(TrackModeColumn.SELECT, track, isSelected[track] ?  Colour.GREEN_FLASHING : Colour.GREEN_LOW);
			 setCellLED(TrackModeColumn.ARM, track, arm[track] ? Colour.RED_FULL : Colour.RED_LOW);
			 setCellLED(TrackModeColumn.SOLO, track, solo[track] ? Colour.YELLOW_FULL : Colour.YELLOW_LOW);
			 setCellLED(TrackModeColumn.MUTE, track, mute[track] ? Colour.ORANGE : Colour.AMBER_LOW);
			 setCellLED(TrackModeColumn.RETURN_TO_ARRANGEMENT, track, Colour.OFF);
		  }
		  else
		  {
			 for(var scene=0; scene<5; scene++)
			 {
				setCellLED(scene, track, Colour.OFF);
			 }
		  }
	 }
	 else {
	 		  for(var scene=0; scene<2; scene++)
		  {
			 setCellLED(track, scene, Colour.OFF);
		  }

		  if (trackExists[track])
		  {
			 setCellLED(track, TrackModeColumn.STOP+2, Colour.OFF);
			 setCellLED(track, TrackModeColumn.SELECT+2, isSelected[track] ?  Colour.GREEN_FLASHING : Colour.GREEN_LOW);
			 setCellLED(track, TrackModeColumn.ARM+2, arm[track] ? Colour.RED_FULL : Colour.RED_LOW);
			 setCellLED(track, TrackModeColumn.SOLO+2, solo[track] ? Colour.YELLOW_FULL : Colour.YELLOW_LOW);
			 setCellLED(track, TrackModeColumn.MUTE+2, mute[track] ? Colour.ORANGE : Colour.AMBER_LOW);
			 setCellLED(track, TrackModeColumn.RETURN_TO_ARRANGEMENT+2, Colour.OFF);
		  }
		  else
		  {
			 for(var scene=2; scene<7; scene++)
			 {
				setCellLED(track, scene, Colour.OFF);
			 }
		  }
	 }
   }
   // Sets the colour of buttons on the Volume Mode, it is special because of the Vumeter so is split from the rest below
   else if (TEMPMODE == TempMode.VOLUME)
   {
      for(var scene=0; scene<8; scene++)
      {
         var c = (volume[track] == scene)
            ? Colour.GREEN_FULL
            : ((vuMeter[track] > scene))
               ? Colour.GREEN_LOW
               : Colour.OFF;

         setCellLED(this.mixerAlignedGrid ? track : scene, this.mixerAlignedGrid ? -Math.abs(scene)+7 : track, c);
      }
   }
   // Colouring of all other pages such as Pan, Sends and User are drawn here
   else
   {
      var value = 0;
      var oncolor = Colour.GREEN_FULL;
      var offcolor = Colour.OFF;

      switch (TEMPMODE)
      {
         case TempMode.PAN:
            value = pan[track];
            oncolor = Colour.AMBER_FULL;
            break;

         case TempMode.SEND_A:
            value = sendA[track];
			oncolor = Colour.YELLOW_FULL;
            break;

         case TempMode.SEND_B:
            value = sendB[track];
			oncolor = Colour.YELLOW_FULL;
            break;

         case TempMode.USER1:
            value = userValue[track];
            break;

         case TempMode.USER2:
            value = userValue[track + 8];
            break;
         case TempMode.USER3:
            value = userValue[track + 16];
            break;
      }

      var drawVal = (value > 0) ? (value + 1) : 0;

      for(var scene=0; scene<8; scene++)
      {
         setCellLED(this.mixerAlignedGrid ? track : scene, this.mixerAlignedGrid ? -Math.abs(scene)+7 : track, (scene < drawVal) ? oncolor : offcolor);
      }
   }
};



gridPage.setTempMode = function(mode)
{
   if (mode == TEMPMODE) return;

   TEMPMODE = mode;

   // This updates the indicators (The rainbow displays on dials for controlls (userControls number 3 is missing? from original script)
   for(var p=0; p<8; p++)
   {
      var track = trackBank.getTrack(p);
      track.getVolume().setIndication(mode == TempMode.VOLUME);
      track.getPan().setIndication(mode == TempMode.PAN);
      track.getSend(0).setIndication(mode == TempMode.SEND_A);
      track.getSend(1).setIndication(mode == TempMode.SEND_B);
      userControls.getControl(p).setIndication(mode == TempMode.USER1);
      userControls.getControl(p + 8).setIndication(mode == TempMode.USER2);
      userControls.getControl(p + 16).setIndication(mode == TempMode.USER3);
   }
};
