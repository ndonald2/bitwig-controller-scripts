var DRUM_CHANNEL = 0;
var DRUM_TRACK_ID = "LCXLDrumMachine";

function DrumMachine()
{
    ControlGroup.call(this);

    this.selectedChannel = 0;
    this.on('selectedChannelChanged', this.selectedChannelChanged.bind(this));

    this.trackBank = host.createMainTrackBank(8, 0, 0);
    this.trackBank.addChannelCountObserver(this.updateDrumTrackConnection.bind(this));

    this.cursorTrack = host.createCursorTrack(DRUM_TRACK_ID, "DrumMachine", 0, 0, false);
    this.cursorTrack.exists().addValueObserver(function (exists) {
        if (!exists) { this.updateDrumTrackConnection(); }
    }.bind(this));

    this.cursorDrumDevice = this.cursorTrack.createCursorDevice("Primary");

    this.drumPadBank = this.cursorDrumDevice.createDrumPadBank(8);
    this.drumPadBank.exists().addValueObserver(this.drumPadsExistChanged.bind(this));

    var layout = Layout[DRUM_CHANNEL];

    this.faders = this.addControl(new ControlGroup(layout.faders.map(function (message, index)
    {
        var channel = this.drumPadBank.getChannel(index);
        return new TrackVolumeEncoder(message, channel);
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

    // Retry finding drum device when template activated

    this.on('activeChanged', function(active) {
        if (active) { this._updateDrumTrackConnection(); }
    }.bind(this));
}

util.inherits(DrumMachine, ControlGroup);

DrumMachine.prototype.selectedChannelChanged = function(index) {
    this.cursorTrack.selctChannel(this.trackBank.getChannel(index));
};

DrumMachine.prototype.updateDrumTrackConnection = function() {
    if (!this.connected) {
        console.log("Drum track not connected, trying selected channel: " + this.selectedChannel);
        this.cursorTrack.selectChannel(this.trackBank.getChannel(this.selectedChannel));
    }
};

DrumMachine.prototype.drumPadsExistChanged = function (exists) {
    this.set('connected', exists);
    if (exists) {
        console.log("Drum device found on channel " + this.selectedChannel);
    } else {
        console.log("Drum device not found on channel " + this.selectedChannel);
    }
};
