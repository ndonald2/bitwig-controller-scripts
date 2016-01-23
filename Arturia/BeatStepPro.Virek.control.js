// Bitwig Control Script for BeatStep Pro
// by Nick Donaldson, 2016
//
// Features:
//  - [x] Channel routings for each sequencer
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

var SEQ_1_INPUT_FILTER = "?0????";
var SEQ_2_INPUT_FILTER = "?1????";
var DRUM_SEQ_INPUT_FILTER = "?9????";

// Initialization and Controller Definition

loadAPI(SCRIPT_API_VERSION);
host.defineController("Arturia", "BeatStep Pro", SCRIPT_VERSION, SCRIPT_UUID, "Nick Donaldson");
host.defineMidiPorts(NUM_PORTS_IN, NUM_PORTS_OUT);
host.addDeviceNameBasedDiscoveryPair([DEVICE_NAME], [DEVICE_NAME]);

// Script Overrides

function init() {
  createChannelRoutings();
}

function exit() {}

// Private Functions

function createChannelRoutings() {
  var inPort = host.getMidiInPort(0);
  inPort.createNoteInput("BeatStep Seq 1", SEQ_1_INPUT_FILTER);
  inPort.createNoteInput("BeatStep Seq 2", SEQ_2_INPUT_FILTER);
  inPort.createNoteInput("BeatStep Drum", DRUM_SEQ_INPUT_FILTER);
}

