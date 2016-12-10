// Returns channel value 1-16
function getMidiChannel(status) {
  return (status & 0x0F) + 1;
}

function isControlMessage(status) {
  return (status & 0xF0) == 0xB0;
}

function isAftertouchMessage(status) {
  return (status & 0xF0) == 0xA0;
}

function getRelativeIncrement(value) {
  return value - 64;
}