
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
  inPort = host.getMidiInPort(0);
  outPort = host.getMidiOutPort(0);
  mainTrackBank = host.createMainTrackBank(8, 2, 0);

  inPort.createNoteInput("BeatStep Seq 1", SEQ_1_INPUT_FILTER);
  inPort.createNoteInput("BeatStep Seq 2", SEQ_2_INPUT_FILTER);
  inPort.createNoteInput("BeatStep Drum", DRUM_SEQ_INPUT_FILTER);

  inPort.setMidiCallback(onMidi);
  createPadBankIfNecessary();
}

function exit() {}

function onMidi(status, data1, data2) {
  if (isControlModeChannel(status)) {
    handleControlModeMessage(status, data1, data2);
  }
}

/// Control Mode

var pressedPads = [];

function handleControlModeMessage(status, data1, data2) {
  //println("Got control mode message: " + status + ", " + data1 + ", " + data2);

  if (isNoteOnMessage(status)) {

    var padIndex = getPadIndex(data1);
    if (padIndex !== null) {
      pressedPads.remove(padIndex);
      pressedPads.push(padIndex);
    }

  } else if (isNoteOffMessage(status)) {

    var padIndex = getPadIndex(data1);
    if (padIndex !== null) {
      pressedPads.remove(padIndex);
    }

  } else if (isControlMessage(status)) {

    var ccNum = data1;
    var ccVal = data2;

    if (!isEncoderControlNumber(ccNum)) {
      return;
    }

    if (!pressedPads.isEmpty()) {
      var padIndex = pressedPads.last();
      handleDrumEncoderInput(padIndex, ccNum, ccVal);
    } else {
      handleMixEncoderInput(ccNum, ccVal);
    }

  }
}

var DRUM_CHANNEL_INDEX = 0;

var drumPadBank = null;

function createPadBankIfNecessary() {
  if (drumPadBank !== null) {
    return true;
  }
  var drumChannel = mainTrackBank.getChannel(DRUM_CHANNEL_INDEX);
  var drumRack = drumChannel.getPrimaryInstrument();
  if (drumRack === null || !drumRack.hasDrumPads()) {
    println("Could not create drum pad bank: project layout is not valid");
    return false;
  }
  drumPadBank = drumRack.createDrumPadBank(16);
  return true;
}

function handleDrumEncoderInput(padIndex, ccNum, ccVal) {
  if (!createPadBankIfNecessary()) {
    return;
  }

  if (!isEncoderInBank1(ccNum)) {
    return;
  }

  var encoderBankIndex = getEncoderIndexInBank(ccNum);
  var padChannel = drumPadBank.getChannel(padIndex);
  var increment = getRelativeIncrement(ccVal, 2.0);

  padChannel.selectInMixer();

  switch (encoderBankIndex) {
    case 0:
      padChannel.getVolume().inc(increment, 128);
      break;
    case 1:
      padChannel.getSend(0).inc(increment, 128);
      break;
    case 4:
      padChannel.getPan().inc(increment, 128);
      break;
    case 5:
      padChannel.getSend(1).inc(increment, 128);
      break;
  }
}

function getChannelIndex(ccNum) {
  var bankIndex = getEncoderIndexInBank(ccNum);
  var channelIndex = bankIndex % 4;
  if (isEncoderInBank2(ccNum)) {
    channelIndex += 4;
  }
  return channelIndex;
}

function handleMixEncoderInput(ccNum, ccVal) {
  var channelIndex = getChannelIndex(ccNum);
  var increment = getRelativeIncrement(ccVal, 2.0);
  var channel = mainTrackBank.getChannel(channelIndex);

  channel.selectInMixer();

  if (getEncoderIndexInBank(ccNum) < 4) {
    channel.getSend(0).inc(increment, 128);
  } else {
    channel.getSend(1).inc(increment, 128);
  }
}

