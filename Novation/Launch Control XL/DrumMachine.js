var DRUM_CHANNEL = 0;
var DRUM_TRACK_ID = "LCXLDrumMachine"

function DrumMachine()
{
    ControlGroup.call(this);

    this.trackBank = host.createMainTrackBank(8, 0, 0);

    this.cursorTrack = host.createCursorTrack(DRUM_TRACK_ID, "DrumMachine", 0, 0, false);

    this.cursorDrumDevice = this.cursorTrack.createCursorDevice("Primary");

    this.drumPadBank = this.cursorDrumDevice.createDrumPadBank(8);

    var layout = Layout[DRUM_CHANNEL];

    this.faders = this.addControl(new ControlGroup(layout.faders.map(function (message, index)
    {
        var encoder = new Encoder(message);
        var channel = this.drumPadBank.getChannel(index);
        encoder.connectParameter(channel.getVolume());
        return encoder;
    }.bind(this))));

    // Proof of concept note lighting

    this.drumPadBank.addChannelScrollPositionObserver(function (pos) {
      this.drumScrollOffset = pos;
    }.bind(this), -1);

    this.noteButtons = this.addControl(new ControlGroup(layout.buttons[0].map(function (message, index)
    {
        var button = new Button(message);
        var channel = this.drumPadBank.getChannel(index);
        channel.addNoteObserver(function (on, key, velocity) {
            if (key - this.drumScrollOffset == index) {
              button.emit('midi', message.hexByteAt(0), message.hexByteAt(1), on == true ? 0x3E : 0x00);
            }
        }.bind(this));
        return button;
    }.bind(this))));

    // Temporary hack to select drum track in cursor (assume is first track)
    this.on('activeChanged', function(active) {
        if (active) {
            this.cursorTrack.selectChannel(this.trackBank.getChannel(0));
        }
    }.bind(this));
}

util.inherits(DrumMachine, ControlGroup);
