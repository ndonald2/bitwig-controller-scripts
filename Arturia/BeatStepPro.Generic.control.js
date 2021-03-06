// Bitwig Generic Script for BeatStep Pro
// by Nick Donaldson, 2016
//
// Features:
//  - Channel routings for each sequencer
//  - 8-Macro control via knob sets 1 and 3 in Control Mode
//  - Track Selection (1-16)

load('./BeatStepPro.utils.js');

// Global constants

var SCRIPT_API_VERSION = 1;
var SCRIPT_VERSION = "0.1";
var SCRIPT_UUID = "097cfe80-c210-11e5-a837-0800200c9a66";

var MACRO_CC_START = 20;
var TRACK_SELECT_CC_START = 102;

var NUM_SELECTABLE_TRACKS = 16;

// Initialization and Controller Definition

loadAPI(SCRIPT_API_VERSION);
host.defineController("Arturia", "BeatStep Pro (Generic)", SCRIPT_VERSION, SCRIPT_UUID, "Nick Donaldson");
host.defineMidiPorts(NUM_PORTS_IN, NUM_PORTS_OUT);
host.addDeviceNameBasedDiscoveryPair([DEVICE_NAME], [DEVICE_NAME]);

// Script Variables
var inPort;
var outPort;
var mainTrackBank;
var cursorTrack;
var cursorDevice;

var trackSelectedByController = false;

// Script Overrides

function init() {
  initializeVariables();
  setupChannelRoutings();
  inPort.setMidiCallback(onMidi);
}

function exit() {}

function initializeVariables() {
  inPort = host.getMidiInPort(0);
  outPort = host.getMidiOutPort(0);
  mainTrackBank = host.createMainTrackBank(NUM_SELECTABLE_TRACKS, 0, 0);
  cursorTrack = host.createCursorTrack(2, 0);
  cursorDevice = host.createEditorCursorDevice();
}

function setupChannelRoutings() {
  inPort.createNoteInput("BeatStep Seq 1", SEQ_1_INPUT_FILTER);
  inPort.createNoteInput("BeatStep Seq 2", SEQ_2_INPUT_FILTER);
  inPort.createNoteInput("BeatStep Drum", DRUM_SEQ_INPUT_FILTER);
}

function onMidi(status, data1, data2) {
  if (isControlModeChannel(status)) {
    handleControlModeMessage(status, data1, data2);
  }
}

/// Control Mode Functions

function isMacroControlNumber(control_num) {
  return control_num >= MACRO_CC_START && control_num < MACRO_CC_START + 8;
}

function isTrackSelectionControlNumber(control_num) {
  return control_num >= TRACK_SELECT_CC_START &&
    control_num < TRACK_SELECT_CC_START + NUM_SELECTABLE_TRACKS;
}

function controlNumToMacroIndex(control_num) {
  return control_num - MACRO_CC_START;
}

function controlNumToTrackIndex(control_num) {
  return control_num - TRACK_SELECT_CC_START;
}

function handleControlModeMessage(status, data1, data2) {
  //println("Got control mode message: " + status + ", " + data1 + ", " + data2);

  // Control Messages
  if (isControlMessage(status)) {

    // Macro Controls
    if (isMacroControlNumber(data1)) {
      var macroIndex = controlNumToMacroIndex(data1);
      handleMacroControl(macroIndex, data2);
    }
    // Track navigation
    else if (isTrackSelectionControlNumber(data1)) {
      var trackIndex = controlNumToTrackIndex(data1);
      handleTrackSelectControl(trackIndex, data2);
    }
  }
}

function handleMacroControl(index, value) {
  var macro = cursorDevice.getMacro(index);
  var increment = getRelativeIncrement(value, 2.0);
  macro.getAmount().inc(increment, 128);
}

function handleTrackSelectControl(index, value) {
  if (value == 0) {
    return;
  }

  trackSelectedByController = true;
  var track = mainTrackBank.getChannel(index);
  track.selectInEditor();
  var primaryDevice = track.createCursorDevice("Primary");
  primaryDevice.selectInEditor();
}

