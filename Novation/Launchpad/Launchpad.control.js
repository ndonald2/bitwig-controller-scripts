// Novation Launcpad script updated from Official Bitwig
//
// Changes to the included script release in Bitwig
//
// UPDATE IN SEPTEMBER 2014
//
// Added the update made to the official script to include Launchpad MINI
// Changed UUID so that both the official script and this script can be used at same time
// 
// UPDATES IN AUGUST 2014
//
// Diatonic updated so that all scales can be played instead of just C, the left and right buttons change the root note and the mixer button changes the diatonic mode
// Turned off note play on velocity change (You can turn it back on in user settings below) as well as brought the velocity values to the user settings so that you can change them easier.
// Fixed error in the console window when scrolling left and right in Piano mode
// Added functionality for Mixer button while in NoteMaps
//
// UPDATES IN JULY 2014
//
// Added a load of comments so others can better understand the code and can modify easier to your liking and grab parts for own scripts for other devices.
// Orientation for the "Arm" page with Mute, Solo, Arm changable with orientation (Mixer button)
// Orientation of the Volume, Pan, Send and User pages changes with the orientation (Mixer button)
// Mix and Arrange view automatically change with orientation
// Scene launch now works in Mixer orientation also for left buttons when holding Session/Clip Launcher button.
// Bitwig indicators for User page 3 added (I suspect they were left out because they don't come out rainbow coloured), But I think they are still nice to have even though they are all white.
// Lights and buttons on the Arm/Solo/Mute page have been reordered/recoloured to match Bitwig's ordering and colours better. i.e Mutes are now orange and on the right to match Bitwig.
// Lights of the right side on clip launcher made no sense so have changed the sends to yellow to match Bitwigs colours for sends and all user page buttons now green
// Lights on the sends pages have been changed to yellow to distinguish them from the user and volume and to match Bitwig's colours for send

// USER SETTINGS
// these are here for people to change who don't have a lot of knowledge of programming.

// Number of pads used for pans - 7 will allow center of pans, 8 will allow finer control but no easy way to center.
var userVarPans = 8;
// Playing of pad on velocity change is turned off, setting this to true will turn it on
var userVelNote = false;
// These setup your velocities
var velocities = [127, 100, 80, 50];


// Start the API
loadAPI(1);

// This stuff is all about defining the script and getting it to autodetect and attach the script to the controller
host.defineController("Novation", "Launchpad (Updated)", "1.0", "72d8bf50-3de5-11e4-916c-0800200c9a66");
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(["Launchpad"], ["Launchpad"]);
host.addDeviceNameBasedDiscoveryPair(["Launchpad S"], ["Launchpad S"]);
host.addDeviceNameBasedDiscoveryPair(["Launchpad Mini"], ["Launchpad Mini"]);

//Detect Multiple Launchpads
for(var i=1; i<20; i++)
{
   var name = i.toString() + "- Launchpad";
   host.addDeviceNameBasedDiscoveryPair([name], [name]);
   host.addDeviceNameBasedDiscoveryPair(["Launchpad MIDI " + i.toString()], ["Launchpad MIDI " + i.toString()]);
   host.addDeviceNameBasedDiscoveryPair(["Launchpad S " + i.toString()], ["Launchpad S " + i.toString()]);
   host.addDeviceNameBasedDiscoveryPair(["Launchpad S MIDI " + i.toString()], ["Launchpad S MIDI " + i.toString()]);
   host.addDeviceNameBasedDiscoveryPair(["Launchpad Mini " + i.toString()], ["Launchpad Mini " + i.toString()]);
   host.addDeviceNameBasedDiscoveryPair(["Launchpad Mini MIDI " + i.toString()], ["Launchpad Mini MIDI " + i.toString()]);

}

// Special section for Linux users
if(host.platformIsLinux())
{
	for(var i=1; i<16; i++)
	{
	   host.addDeviceNameBasedDiscoveryPair(["Launchpad S " + + i.toString() + " MIDI 1"], ["Launchpad S " + + i.toString() + " MIDI 1"]);
	   host.addDeviceNameBasedDiscoveryPair(["Launchpad Mini " + + i.toString() + " MIDI 1"], ["Launchpad Mini " + + i.toString() + " MIDI 1"]);
	}
}

// TempMode is a variable used for the Temporary views used in ClipLauncher mode.
var TempMode =
{
   OFF:-1,
   VOLUME:0,
   PAN:1,
   SEND_A:2,
   SEND_B:3,
   TRACK:4,
   SCENE:5,
   USER1:6,
   USER2:7,
   USER3:8
};

// loads up the other files needed
load("launchpad_constants.js"); // contains CCs, Colour values and other variables used across the scripts
load("launchpad_page.js"); // defines the page type which is used for the different pages on the Launchpad
load("launchpad_notemap.js"); // works out all the notemaps, the scales and drawing of the black and white keys
load("launchpad_grid.js"); // draws the main clip launcher and other pages such as volume, pan, sends, and user controls
load("launchpad_keys.js"); // draws the keys as set in launchpad_notemap and places them across the pads
load("launchpad_step_sequencer.js"); // everything to do with the step sequencer

// activePage is the page displayed on the Launchpad, the function changes the page and displays popups
var activePage = null;

function setActivePage(page)
{
   var isInit = activePage == null;

   if (page != activePage)
   {
      activePage = page;
      if (!isInit)
      {
         host.showPopupNotification(page.title);
      }

      updateNoteTranlationTable();
      updateVelocityTranslationTable();

      // Update indications in the app
      for(var p=0; p<8; p++)
      {
         var track = trackBank.getTrack(p);
         track.getClipLauncher().setIndication(activePage == gridPage);
      }
   }
}

// This sets the order of the buttons on the track control temporary mode
var TrackModeColumn =
{
   STOP:0,
   SELECT:1,
   ARM:2,
   SOLO:3,
   MUTE:4,
   RETURN_TO_ARRANGEMENT:7
};

var TEMPMODE = -1;

var IS_EDIT_PRESSED = false;
var IS_RECORD_PRESSED = false;

// Declare arrays which are used to store information received from Bitwig about what is going on to display on pads
var volume = initArray(0, 8);
var pan = initArray(0, 8);
var mute = initArray(0, 8);
var solo = initArray(0, 8);
var arm = initArray(0, 8);
var isSelected = initArray(0, 8);
var trackExists = initArray(0, 8);
var sendA = initArray(0, 8);
var sendB = initArray(0, 8);
var vuMeter = initArray(0, 8);
var masterVuMeter = 0;

var userValue = initArray(0, 24);

var hasContent = initArray(0, 64);
var isPlaying = initArray(0, 64);
var isRecording = initArray(0, 64);
var isQueued = initArray(0, 64);

// Observer functions to store receive information into the above arrays
function getTrackObserverFunc(track, varToStore)
{
   return function(value)
   {
      varToStore[track] = value;
   }
}

function getGridObserverFunc(track, varToStore)
{
   return function(scene, value)
   {
      varToStore[scene*8 + track] = value;
   }
}

var noteOn = initArray(false, 128);


// The init function gets called when initializing by Bitwig
function init()
{
   // setup MIDI in
   host.getMidiInPort(0).setMidiCallback(onMidi);

   noteInput = host.getMidiInPort(0).createNoteInput("Launchpad", "80????", "90????");
   noteInput.setShouldConsumeEvents(false);

   // Create a transport and application control section
   transport = host.createTransport();
   application = host.createApplication();

   // a Trackbank is the tracks, sends and scenes being controlled, these arguments are set to 8,2,8 in the launchpad_constants.js file changing them will change the size of the grid displayed on the Bitwig Clip Launcher
   trackBank = host.createMainTrackBank(NUM_TRACKS, NUM_SENDS, NUM_SCENES);

   // This scrolls through the controllable tracks and clips and picks up the info from Bitwig to later display/control, it stores them in the arrays declared above
   for(var t=0; t<NUM_TRACKS; t++)
   {
      var track = trackBank.getTrack(t);

      track.getVolume().addValueObserver(8, getTrackObserverFunc(t, volume));
      track.getPan().addValueObserver(userVarPans, getTrackObserverFunc(t, pan));
      track.getSend(0).addValueObserver(8, getTrackObserverFunc(t, sendA));
      track.getSend(1).addValueObserver(8, getTrackObserverFunc(t, sendB));
      track.getMute().addValueObserver(getTrackObserverFunc(t, mute));
      track.getSolo().addValueObserver(getTrackObserverFunc(t, solo));
      track.getArm().addValueObserver(getTrackObserverFunc(t, arm));
      track.exists().addValueObserver(getTrackObserverFunc(t, trackExists));

      var clipLauncher = track.getClipLauncher();

      clipLauncher.addHasContentObserver(getGridObserverFunc(t, hasContent));
      clipLauncher.addIsPlayingObserver(getGridObserverFunc(t, isPlaying));
      clipLauncher.addIsRecordingObserver(getGridObserverFunc(t, isRecording));
      clipLauncher.addIsQueuedObserver(getGridObserverFunc(t, isQueued));
	  
      track.addVuMeterObserver(7, -1, true, getTrackObserverFunc(t, vuMeter));
      track.addIsSelectedObserver(getTrackObserverFunc(t, isSelected));
	  
   }

   // These next 4 pick up whether the Clip Launcher can be moved
   trackBank.addCanScrollTracksUpObserver(function(canScroll)
   {
      gridPage.canScrollTracksUp = canScroll;
   });

   trackBank.addCanScrollTracksDownObserver(function(canScroll)
   {
      gridPage.canScrollTracksDown = canScroll;
   });

   trackBank.addCanScrollScenesUpObserver(function(canScroll)
   {
      gridPage.canScrollScenesUp = canScroll;
   });

   trackBank.addCanScrollScenesDownObserver(function(canScroll)
   {
      gridPage.canScrollScenesDown = canScroll;
   });
   
   // Cursor track allow selection of a track
   cursorTrack = host.createCursorTrack(0, 0);
   cursorTrack.addNoteObserver(seqPage.onNotePlay);

   // Picks up the Master Track from Bitwig for use displaying the VuMeter
   masterTrack = host.createMasterTrack(0);
   masterTrack.addVuMeterObserver(8, -1, true, function(level)
   {
      masterVuMeter = level;
   });

   // Picks up the controllable knobs, buttons which have been set via "Learn Controller Assignment". There are 24 set here because there are 3 pages of user controls with 8 assignable controls on each
   userControls = host.createUserControls(24);

   for(var u=0; u<24; u++)
   {
      var control = userControls.getControl(u);

      control.addValueObserver(8, getTrackObserverFunc(u, userValue));
      control.setLabel("U" + (u+1));
   }

   // Created a Cursor Clip section. I believe this section is used to create a section used on the Drum Machine device
   // ToDO: host.createCursorClipSection is deprecated and should be updated
   cursorClip = host.createCursorClip(SEQ_BUFFER_STEPS, 128);
   cursorClip.addStepDataObserver(seqPage.onStepExists);
   cursorClip.addPlayingStepObserver(seqPage.onStepPlay);
   cursorClip.scrollToKey(0);

   // Call resetdevice which clears all the lights
   resetDevice();
   setGridMappingMode();
   enableAutoFlashing();
   setActivePage(gridPage);

   updateNoteTranlationTable();
   updateVelocityTranslationTable();

   // Calls the function just below which displays the funky Bitwig logo, which ends the initialization stage 
   animateLogo();
}

// Animates the Bitwig logo at the start. The pads that are drawn are defined further down this script in the drawBitwigLogo function
function animateLogo()
{
   if (logoPhase > 7)
   {
      setDutyCycle(2, 6);
      return;
   }
   else if (logoPhase > 6)
   {
      showBitwigLogo = false;
      var i = 0.5 - 0.5 * Math.cos(logoPhase * Math.PI);
      setDutyCycle(Math.floor(1 + 5 * i), 18);
   }
   else
   {
      var i = 0.5 - 0.5 * Math.cos(logoPhase * Math.PI);
      setDutyCycle(Math.floor(1 + 15 * i), 18);
   }

   logoPhase += 0.2;

   host.scheduleTask(animateLogo, null, 30);
}

var logoPhase = 0;
var showBitwigLogo = true;

// Function called on exit of the script
function exit()
{
   resetDevice();
}

// Reset all lights by sending MIDI and sets all values in the pendingLEDs array to 0
function resetDevice()
{
   sendMidi(0xB0, 0, 0);

   for(var i=0; i<80; i++)
   {
      pendingLEDs[i] = 0;
   }
   flushLEDs();
}

// I'm not sure what these functions do
// enableAutoFlashing and setGridMappingMode are called during initialization.
// setDutyCycle is called by the animateLogo function, They are likely something to do with light display

function enableAutoFlashing()
{
   sendMidi(0xB0, 0, 0x28);
}

function setGridMappingMode()
{
   sendMidi(0xB0, 0, 1);
}

function setDutyCycle(numerator, denominator)
{
   if (numerator < 9)
   {
      sendMidi(0xB0, 0x1E, 16 * (numerator - 1) + (denominator - 3));
   }
   else
   {
      sendMidi(0xB0, 0x1F, 16 * (numerator - 9) + (denominator - 3));
   }
}

function updateNoteTranlationTable()
{
   //println("updateNoteTranlationTable");
   var table = initArray(-1, 128);

   for(var i=0; i<128; i++)
   {
      var y = i >> 4;
      var x = i & 0xF;

      if (x < 8 && activePage.shouldKeyBeUsedForNoteInport(x, y))
      {
         table[i] = activeNoteMap.cellToKey(x, y);
      }
   }

   noteInput.setKeyTranslationTable(table);
}

function updateVelocityTranslationTable()
{
   var table = initArray(seqPage.velocity, 128);
   table[0] = 0;

   noteInput.setVelocityTranslationTable(table);
}

// This is the main function which runs whenever a MIDI signal is sent
// You can uncomment the printMIDI below to see the MIDI signals within Bitwigs Controller script console

function onMidi(status, data1, data2)
{
	//printMidi(status, data1, data2);

   if (MIDIChannel(status) != 0) return;

   if (isChannelController(status))
   {
      // isPressed checks whether MIDI signal is above 0 in value declaring that button is being pressed
      var isPressed = data2 > 0;

	  // This section changes the page within the script displayed on the device
	  // data1 is the CC, the CC values are defined within the launchpad_contants script and range from 104 to 111 for the topbuttons
      switch(data1)
      {
         case TopButton.SESSION:
            if (isPressed)
            {
               setActivePage(gridPage);
               gridPage.setTempMode(TempMode.SCENE);
            }
            else gridPage.setTempMode(TempMode.OFF);
            break;

         case TopButton.USER1:
            if (isPressed)
            {
               setActivePage(keysPage);
            }
            break;

         case TopButton.USER2:
            if (!isPressed)
            {
               setActivePage(seqPage);
            }

            IS_EDIT_PRESSED = isPressed;

            break;

         case TopButton.MIXER:
            activePage.onShift(isPressed);
            break;

         case TopButton.CURSOR_LEFT:
            activePage.onLeft(isPressed);
            break;

         case TopButton.CURSOR_RIGHT:
            activePage.onRight(isPressed);
            break;

         case TopButton.CURSOR_UP:
            activePage.onUp(isPressed);
            break;

         case TopButton.CURSOR_DOWN:
            activePage.onDown(isPressed);
            break;
      }
   }

   if (isNoteOn(status) || isNoteOff(status, data2))
   {
      var row = data1 >> 4;
      var column = data1 & 0xF;

      if (column < 8)
      {
         activePage.onGridButton(row, column, data2 > 0);
      }
      else
      {
         activePage.onSceneButton(row, data2 > 0);
      }
   }
}

// Clears all the lights
function clear()
{
   for(var i=0; i<80; i++)
   {
      pendingLEDs[i] = Colour.OFF;
   }
}

function flush()
{
   if (showBitwigLogo)
   {
      drawBitwigLogo();
   }
   else
   {
      activePage.updateOutputState();
   }

   flushLEDs();
}

// Defines the Pads to be shown to draw the Bitwig logo
// calls the mixColour function within the launchpad_constants.js script
function drawBitwigLogo()
{
   clear();

   var c = mixColour(2, 1, false);

   for(var x=2;x<=5; x++) setCellLED(x, 2, c);
   for(var x=1;x<=6; x++) setCellLED(x, 3, c);

   setCellLED(1, 4, c);
   setCellLED(2, 4, c);
   setCellLED(5, 4, c);
   setCellLED(6, 4, c);
}

// Sends the Top LED lights to the pendingLEDs array. LED top have a value of 72 to 80
function setTopLED(index, colour)
{
   pendingLEDs[LED.TOP + index] = colour;
}

// Sends the right LED lights to the pendingLEDs array. LED scene have a value of 64 to 72
function setRightLED(index, colour)
{
   pendingLEDs[LED.SCENE + index] = colour;
}

// Sends the main pads to the pendingLEDs array. LED scene have a value of 0 to 63
function setCellLED(column, row, colour)
{
   var key = row * 8 + column;

   pendingLEDs[key] = colour;
}

/** Cache for LEDs needing to be updated, which is used so we can determine if we want to send the LEDs using the
 * optimized approach or not, and to send only the LEDs that has changed.
 */
 
 // arrays of 80 buttons, the main 64 pads and the 8 at the top and 8 at side. Pending is used for lights to be sent, active contains the lights already on

var pendingLEDs = new Array(80);
var activeLEDs = new Array(80);

// This function compares the LEDs in pending to those in active and if there is a difference it will send them via MIDI message
// If there is more than 30 lights changed it sends the MIDI in a single message ("optimized mode") rather than individually
function flushLEDs()
{

	// changedCount contains number of lights changed
   var changedCount = 0;

   // count the number of LEDs that are going to be changed by comparing pendingLEDs to activeLEDs array
   for(var i=0; i<80; i++)
   {
      if (pendingLEDs[i] != activeLEDs[i]) changedCount++;
   }

   // exit function if there are none to be changed
   if (changedCount == 0) return;

   //uncommenting this displays a count of the number of LEDs to be changed
   //println("Repaint: " + changedCount + " LEDs");

   // if there is a lot of LEDs, use an optimized mode (which looks to me like it sends all in one MIDI message
   if (changedCount > 30)
   {
      // send using channel 3 optimized mode
      for(var i = 0; i<80; i+=2)
      {
         sendMidi(0x92, pendingLEDs[i], pendingLEDs[i+1]);
         activeLEDs[i] = pendingLEDs[i];
         activeLEDs[i+1] = pendingLEDs[i+1];
      }
      sendMidi(0xB0, 104 + 7, activeLEDs[79]); // send dummy message to leave optimized mode
   }
   // if not a lot of LEDs need changing send them in individual MIDI messages
   else
   {
      for(var i = 0; i<80; i++)
      {
         if (pendingLEDs[i] != activeLEDs[i])
         {
            activeLEDs[i] = pendingLEDs[i];

            var colour = activeLEDs[i];

            if (i < 64) // Main Grid
            {
               var column = i & 0x7;
               var row = i >> 3;
               sendMidi(0x90, row*16 + column, colour);
            }
            else if (i < 72)    // Right buttons
            {
               sendMidi(0x90, 8 + (i - 64) * 16, colour);
            }
            else    // Top buttons
            {
               sendMidi(0xB0, 104 + (i - 72), colour);
            }
         }
      }
   }
}

// This function is not called anywhere within the rest of the Launchpad script. textToPattern sounds like it may have been the start of displaying text on the Launchpad, or could be left from another script for another device.

/* Format text into a bit pattern that can be displayed on 4-pixels height */

function textToPattern(text)
{
   var result = [];

   for(var i=0; i<text.length; i++)
   {
      if (i != 0) result.push(0x0); // mandatory spacing

      switch (text.charAt(i))
      {
         case '0':
            result.push(0x6, 0x9, 0x6);
            break;

         case '1':
            result.push(0x4, 0xF);
            break;

         case '2':
            result.push(0x5, 0xB, 0x5);
            break;

         case '3':
            result.push(0x9, 0x9, 0x6);
            break;

         case '4':
            result.push(0xE, 0x3, 0x2);
            break;
      }
   }

   return result;
}
