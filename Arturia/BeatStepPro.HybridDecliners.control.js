
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
var primaryRemoteControlsCursor;

var drumDeviceChainCursor;
var drumDeviceCursor;
var drumRemoteControlsCursor;

var selectedDrumIndex = null;

// Script Overrides

function init() {
  inPort = host.getMidiInPort(0);
  outPort = host.getMidiOutPort(0);

  mainTrackBank = host.createMainTrackBank(16 - NUM_FX_TRACKS, NUM_FX_TRACKS, 0);
  effectTrackBank = host.createEffectTrackBank(NUM_FX_TRACKS, 0);

  primaryTrackCursor = host.createCursorTrack(NUM_FX_TRACKS, 0);
  primaryDeviceCursor = primaryTrackCursor.createCursorDevice("Primary", NUM_FX_TRACKS);
  primaryRemoteControlsCursor = primaryDeviceCursor.createCursorRemoteControlsPage(8);
  for (var i=0; i<8; i++) {
    primaryRemoteControlsCursor.getParameter(i).setIndication(true);
  }

  drumTrackBank = primaryDeviceCursor.createDrumPadBank(16);
  drumDeviceChainCursor = primaryDeviceCursor.createCursorLayer();
  drumDeviceCursor = drumDeviceChainCursor.createDeviceBank(1).getDevice(0);
  drumRemoteControlsCursor = drumDeviceCursor.createCursorRemoteControlsPage(8);
  for (var i=0; i<8; i++) {
    drumRemoteControlsCursor.getParameter(i).setIndication(true);
  }

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

    if (isStepControlNumber(ccNum) && ccVal > 0) {
      var stepIndex = getStepIndex(ccNum);
      selectChannel(stepIndex);
    }

    if (isEncoderControlNumber(ccNum)) {
      if (isEncoderInBank1(ccNum)) {
        handleMixEncoderInput(ccNum, ccVal);
      } else if (isEncoderInBank2(ccNum)) {
        handleParamEncoderInput(ccNum, ccVal);
      }
    }
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
    primaryTrackCursor.selectChannel(channel);
    primaryTrackCursor.selectInMixer();
    primaryDeviceCursor.selectInEditor();
    selectedDrumIndex = null;
  }
}

function selectDrum(padIndex) {
    primaryTrackCursor.selectChannel(mainTrackBank.getChannel(0));
    var drumPad = drumTrackBank.getChannel(padIndex);
    drumPad.selectInMixer();
    drumPad.selectInEditor();
    selectedDrumIndex = padIndex;
}

function handleMixEncoderInput(ccNum, ccVal) {
  var increment = getRelativeIncrement(ccVal, 2.0);
  var encoderBankIndex = getEncoderIndexInBank(ccNum);
  var selectedTrack = currentlySelectedTrack();

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

function handleParamEncoderInput(ccNum, ccVal) {
  var increment = getRelativeIncrement(ccVal, 2.0);
  var encoderBankIndex = getEncoderIndexInBank(ccNum);
  var param;
  if (selectedDrumIndex == null) {
    primaryDeviceCursor.isRemoteControlsSectionVisible().set(true);
    param = primaryRemoteControlsCursor.getParameter(encoderBankIndex);
  } else {
    drumDeviceCursor.isRemoteControlsSectionVisible().set(true);
    param = drumRemoteControlsCursor.getParameter(encoderBankIndex);
  }
  param.value().inc(increment, 128);
}

function currentlySelectedTrack() {
  if (selectedDrumIndex != null) {
    return drumTrackBank.getChannel(selectedDrumIndex);
  } else {
     return primaryTrackCursor;
  }
}

