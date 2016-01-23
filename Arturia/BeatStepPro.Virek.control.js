// Bitwig Control Script for BeatStep Pro
// by Nick Donaldson, 2016
//
// Features:
//  - [x] Channel routings for each sequencer
//  - [ ] 8-Macro control via knob sets 1 and 3 in Control Mode
//  - [ ] Track Selection (1-16)
//  - [ ] Device selection within current track
//  - [ ] Transport Mappings (BeatStep slaved to Bitwig)

// Global constants

var SCRIPT_API_VERSION = 1;
var SCRIPT_VERSION = "0.1";
var SCRIPT_UUID = "097cfe80-c210-11e5-a837-0800200c9a66";

var DEVICE_NAME = "Arturia BeatStep Pro";
var NUM_PORTS_IN = 1;
var NUM_PORTS_OUT = 1;
var CONTROL_MODE_CHANNEL = 5;

var SEQ_1_INPUT_FILTER = "?0????";
var SEQ_2_INPUT_FILTER = "?1????";
var DRUM_SEQ_INPUT_FILTER = "?9????";

var MACRO_CC_START = 20;
var CHANNEL_SELECT_CC_START = 102;

// Initialization and Controller Definition

loadAPI(SCRIPT_API_VERSION);
host.defineController("Arturia", "BeatStep Pro", SCRIPT_VERSION, SCRIPT_UUID, "Nick Donaldson");
host.defineMidiPorts(NUM_PORTS_IN, NUM_PORTS_OUT);
host.addDeviceNameBasedDiscoveryPair([DEVICE_NAME], [DEVICE_NAME]);

// Script Variables
var inPort;
var outPort;
var cursorDevice;

// Script Overrides

function init() {
  inPort = host.getMidiInPort(0);
  outPort = host.getMidiOutPort(0);
  cursorDevice = host.createEditorCursorDevice();

  inPort.setMidiCallback(onMidi);
  setupChannelRoutings();
}

function exit() {}

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

function isControlModeChannel(status) {
  var channel = getMidiChannel(status);
  return channel == CONTROL_MODE_CHANNEL;
}

function isMacroControlNumber(control_num) {
  return control_num >= MACRO_CC_START && control_num < MACRO_CC_START + 8;
}

function controlNumToMacroIndex(control_num) {
  return control_num - MACRO_CC_START;
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

  }
}

function handleMacroControl(index, value) {
  var macro = cursorDevice.getMacro(index);
  var increment = getRelativeIncrement(value);
  macro.getAmount().inc(increment, 128);
}

/// MIDI Utils

// Returns channel value 1-16
function getMidiChannel(status) {
  return (status & 0x0F) + 1;
}

function isControlMessage(status) {
  return (status & 0xF0) == 0xB0;
}

function getRelativeIncrement(value) {
  return value - 64;
}
