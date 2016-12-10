load('../Utils/ArrayUtils.js');
load('../Utils/MIDIUtils.js');

// Constants

var DEVICE_NAME = "Arturia BeatStep Pro";
var NUM_PORTS_IN = 1;
var NUM_PORTS_OUT = 1;
var CONTROL_MODE_CHANNEL = 5;

var SEQ_1_INPUT_FILTER = "?0????";
var SEQ_2_INPUT_FILTER = "?1????";
var DRUM_SEQ_INPUT_FILTER = "?9????";

// An encoder "bank" is a group of 8 encoders stacked 4 over 4.
// So, Set 1 & 3 form Bank 1 and Set 2 & 4 form Bank 2. Top left
// is the start control number, incrementing horizontally and then back
// to the bottom row.
//
//    (Set 1)
//  0  1  2  3
//  4  5  6  7
//    (Set 3)
//
//     etc

var ENCODER_BANK1_START = 20;
var ENCODER_BANK2_START = 52;

// Util Functions

function isControlModeChannel(status) {
  var channel = getMidiChannel(status);
  return channel == CONTROL_MODE_CHANNEL;
}

function isEncoderControlNumber(controlNum) {
  return isEncoderInBank1(controlNum) || isEncoderInBank2(controlNum);
}

function isEncoderInBank1(controlNum) {
  return (controlNum >= ENCODER_BANK1_START && controlNum < ENCODER_BANK1_START + 8);
}

function isEncoderInBank2(controlNum) {
  return (controlNum >= ENCODER_BANK2_START && controlNum < ENCODER_BANK2_START + 8);
}

function getEncoderIndexInBank(controlNum) {
  if (isEncoderInBank1(controlNum)) {
    return controlNum - ENCODER_BANK1_START;
  } else if (isEncoderInBank2(controlNum)) {
    return controlNum - ENCODER_BANK2_START;
  }
}

// Pad buttens indexed the same way the drums are.
// Bottom left pad is index 0, top right is 15
//
// 8 9 10 11 12 13 14 15
// 0 1  2  3  4  5  6  7

var PAD_START = 36;

function getPadIndex(noteNum) {
  if (noteNum >= PAD_START && noteNum < PAD_START + 16) {
    return noteNum - PAD_START;
  }
  return null;
}
