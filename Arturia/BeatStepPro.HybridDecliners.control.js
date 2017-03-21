
load('./BeatStepPro.utils.js');

// Global constants

var SCRIPT_API_VERSION = 2;
var SCRIPT_VERSION = "0.1";
var SCRIPT_UUID = "af9d9ec7-258a-4415-941f-c506d203b6f0";

var NUM_FX_TRACKS = 2;
var DRUM_RESET_CC_NUM = 102;

// Initialization and Controller Definition

loadAPI(SCRIPT_API_VERSION);
host.defineController("Arturia", "BeatStep Pro (Hybrid Decliners Live)", SCRIPT_VERSION, SCRIPT_UUID, "Nick Donaldson");
host.defineMidiPorts(NUM_PORTS_IN, NUM_PORTS_OUT);
host.addDeviceNameBasedDiscoveryPair([DEVICE_NAME], [DEVICE_NAME]);

// Script Variables
var inPort;
var outPort;

var mainTrackBank;
var effectTrackBank;
var drumTrackBank;

var primaryTrackCursor;
var primaryDeviceCursor;

var selectedDrumIndex = null;

// Script Overrides

function init() {
  inPort = host.getMidiInPort(0);
  outPort = host.getMidiOutPort(0);

  mainTrackBank = host.createMainTrackBank(16 - NUM_FX_TRACKS, NUM_FX_TRACKS, 0);
  effectTrackBank = host.createEffectTrackBank(NUM_FX_TRACKS, 0);

  primaryTrackCursor = host.createCursorTrack(NUM_FX_TRACKS, 0);
  primaryDeviceCursor = primaryTrackCursor.createCursorDevice("Primary", 2);

  drumTrackBank = primaryDeviceCursor.createDrumPadBank(16);

  inPort.createNoteInput("BeatStep Seq 1", SEQ_1_INPUT_FILTER);
  inPort.createNoteInput("BeatStep Seq 2", SEQ_2_INPUT_FILTER);
  inPort.createNoteInput("BeatStep Drum", DRUM_SEQ_INPUT_FILTER);

  inPort.setMidiCallback(onMidi);
}

function exit() {}

function onMidi(status, data1, data2) {
  if (isControlModeChannel(status)) {
    handleControlModeMessage(status, data1, data2);
  }
}

/// Control Mode

function handleControlModeMessage(status, data1, data2) {
  //println("Got control mode message: " + status + ", " + data1 + ", " + data2);

  if (isNoteOnMessage(status)) {

    var padIndex = getPadIndex(data1);
    if (padIndex !== null) {
      selectDrum(padIndex);
    }

  } else if (isControlMessage(status)) {

    var ccNum = data1;
    var ccVal = data2;

    if (isStepControlNumber(ccNum)) {
      var stepIndex = getStepIndex(ccNum);
      selectChannel(stepIndex);
    }

    if (isEncoderControlNumber(ccNum)) {
      if (isEncoderInBank1(ccNum)) {
        handleMixEncoderInput(ccNum, ccVal);
      }
    }

    //if (ccNum == DRUM_RESET_CC_NUM && ccVal > 0) {
    //  // Reset all mix params for every drum held down
    //  if (!pressedPads.isEmpty()) {
    //    pressedPads.forEach(function(padIndex) {
    //      resetDrumSends(padIndex);
    //    });
    //  }
    //}
  }
}

function selectChannel(index) {
  var channel = null;
  var mainTrackCount = 16 - NUM_FX_TRACKS;

  if (index < mainTrackCount) {
    channel = mainTrackBank.getChannel(index);
  } else if (index < 16) {
    channel = effectTrackBank.getChannel(index - mainTrackCount);
  }

  if (channel != null) {
    channel.selectInMixer();
    selectedDrumIndex = null;
  }
}

function selectDrum(padIndex) {
    primaryTrackCursor.selectChannel(mainTrackBank.getChannel(0));
    drumTrackBank.getChannel(padIndex).selectInMixer();
    selectedDrumIndex = padIndex;
}

function handleMixEncoderInput(ccNum, ccVal) {

  var increment = getRelativeIncrement(ccVal, 2.0);
  var encoderBankIndex = getEncoderIndexInBank(ccNum);

  var selectedTrack;
  if (selectedDrumIndex != null) {
    selectedTrack = drumTrackBank.getChannel(selectedDrumIndex);
  } else {
    selectedTrack = primaryTrackCursor;
  }

  switch (encoderBankIndex) {
    case 0:
      selectedTrack.getPan().inc(increment, 128);
      break;
    case 1:
      selectedTrack.getSend(0).inc(increment, 128);
      break;
    case 4:
      selectedTrack.getVolume().inc(increment, 128);
      break;
    case 5:
      selectedTrack.getSend(1).inc(increment, 128);
      break;
  }
}

function resetDrumSends(padIndex) {
  var padChannel = drumPadBank.getChannel(padIndex);
  padChannel.getSend(0).setRaw(0.0);
  padChannel.getSend(1).setRaw(0.0);
}

function getEncoderChannelIndex(ccNum) {
  var bankIndex = getEncoderIndexInBank(ccNum);
  var channelIndex = bankIndex % 4;
  if (isEncoderInBank2(ccNum)) {
    channelIndex += 4;
  }
  return channelIndex;
}

