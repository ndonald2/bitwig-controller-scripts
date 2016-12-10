// Constants

var DEVICE_NAME = "Arturia BeatStep Pro";
var NUM_PORTS_IN = 1;
var NUM_PORTS_OUT = 1;
var CONTROL_MODE_CHANNEL = 5;

var SEQ_1_INPUT_FILTER = "?0????";
var SEQ_2_INPUT_FILTER = "?1????";
var DRUM_SEQ_INPUT_FILTER = "?9????";

// Util Functions

load('../Utils/MIDIUtils.js')

function isControlModeChannel(status) {
  var channel = getMidiChannel(status);
  return channel == CONTROL_MODE_CHANNEL;
}

