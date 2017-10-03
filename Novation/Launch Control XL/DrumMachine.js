var DRUM_CHANNEL = 0;
var DRUM_TRACK_ID = "LCXLDrumMachine"

function DrumMachine()
{
    ControlGroup.call(this);

    this.trackBank = host.createMainTrackBank(8, 0, 0);

    this.cursorTrack = host.createCursorTrack(DRUM_TRACK_ID, "DrumMachine", 0, 0, false);

    this.cursorDrumDevice = this.cursorTrack.createCursorDevice("Primary");

    this.drumPadBank = this.cursorDrumDevice.createDrumPadBank(8);

    this.faders = this.addControl(new ControlGroup(Layout[DRUM_CHANNEL].faders.map(function (message, index)
    {
        var encoder = new Encoder(message);
        var channel = this.drumPadBank.getChannel(index);
        encoder.connectParameter(channel.getVolume());
        return encoder;
    }.bind(this))));

    // Temporary hack to select drum track in cursor (assume is first track)
    this.on('activeChanged', function(active) {
        if (active) {
            this.cursorTrack.selectChannel(this.trackBank.getChannel(0));
        }
    }.bind(this));
}

util.inherits(DrumMachine, ControlGroup);
