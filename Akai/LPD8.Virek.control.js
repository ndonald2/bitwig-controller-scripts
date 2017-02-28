// Bitwig controller script for AKAI LPD
// by Nick Donaldson, 2016
//
// Global constants

var SCRIPT_API_VERSION = 1;
var SCRIPT_VERSION = "0.1";
var SCRIPT_UUID = "b5a7af1c-23b0-4d4c-b8b6-1ef889bbbee2";

var DEVICE_NAME = "LPD8";
var NUM_PORTS_IN = 1;
var NUM_PORTS_OUT = 1;

// Initialization and Controller Definition

loadAPI(SCRIPT_API_VERSION);
host.defineController("Akai", "LPD8 (Generic)", SCRIPT_VERSION, SCRIPT_UUID, "Nick Donaldson");
host.defineMidiPorts(NUM_PORTS_IN, NUM_PORTS_OUT);
host.addDeviceNameBasedDiscoveryPair([DEVICE_NAME], [DEVICE_NAME]);

function init() {}
