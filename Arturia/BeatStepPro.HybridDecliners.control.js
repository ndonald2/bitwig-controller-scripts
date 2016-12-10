
load('./BeatStepPro.utils.js');

// Global constants

var SCRIPT_API_VERSION = 1;
var SCRIPT_VERSION = "0.1";
var SCRIPT_UUID = "af9d9ec7-258a-4415-941f-c506d203b6f0";

// Initialization and Controller Definition

loadAPI(SCRIPT_API_VERSION);
host.defineController("Arturia", "BeatStep Pro (Hybrid Decliners Live)", SCRIPT_VERSION, SCRIPT_UUID, "Nick Donaldson");
host.defineMidiPorts(NUM_PORTS_IN, NUM_PORTS_OUT);
host.addDeviceNameBasedDiscoveryPair([DEVICE_NAME], [DEVICE_NAME]);

// Script Variables
var inPort;
var outPort;
var mainTrackBank;

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

function handleControlModeMessage(status, data1, data2) {
  //println("Got control mode message: " + status + ", " + data1 + ", " + data2);

  // Control Messages
  if (isControlMessage(status)) {

  }
}

