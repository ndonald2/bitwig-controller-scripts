var DRUM_CHANNEL = 0;
var DRUM_MIN_PAD_OFFSET = 36;
var DRUM_MAX_PAD_OFFSET = 44;
var DRUM_TRACK_ID = "LCXLDrumMachine";

load('src/drum/DrumPadButton.js');
load('src/drum/DrumPadSelectorButtons.js');

function DrumMachine()
{
    ControlGroup.call(this);

    this.selectedChannel = 0;
    this.on('selectedChannelChanged', this.selectedChannelChanged.bind(this));

    this.trackBank = host.createMainTrackBank(8, 0, 0);
    this.trackBank.addChannelCountObserver(this.updateDrumTrackConnection.bind(this));

    this.cursorTrack = host.createCursorTrack(DRUM_TRACK_ID, "DrumMachine", 2, 0, false);
    this.cursorTrack.exists().addValueObserver(function (exists) {
        if (!exists) { this.updateDrumTrackConnection(); }
    }.bind(this));

    this.cursorDrumDevice = this.cursorTrack.createCursorDevice("Primary");

    this.drumPadBank = this.cursorDrumDevice.createDrumPadBank(8);
    this.drumPadBank.exists().addValueObserver(this.drumPadsExistChanged.bind(this));

    var layout = Layout[DRUM_CHANNEL];

    this.sendLeds = this.addControl(new ControlGroup(layout.leds.slice(0, 2).map(function (messages, sendIndex) {
        return new ControlGroup(messages.map(function (message, index) {
            var channel = this.drumPadBank.getChannel(index);
            return new TrackSendLed(message, Colors.Mixer.Sends, Colors.Mixer.NoTrack, channel, sendIndex);
        }.bind(this)));
    }.bind(this))));

    this.sends = this.addControl(new ControlGroup(layout.encoders.slice(0, 2).map(function (messages, sendIndex) {
        return new ControlGroup(messages.map(function (message, index) {
            var channel = this.drumPadBank.getChannel(index);
            return (new TrackSendEncoder(message, channel, sendIndex));
        }.bind(this)));
    }.bind(this))));

    this.panLeds = this.addControl(new ControlGroup(layout.leds[2].map(function (message, index) {
        var channel = this.drumPadBank.getChannel(index);
        return new TrackLed(message, Colors.Mixer.Pans, Colors.Mixer.NoTrack, channel);
    }.bind(this))));

    this.pans = this.addControl(new ControlGroup(layout.encoders[2].map(function (message, index) {
        var channel = this.drumPadBank.getChannel(index);
        return new TrackPanEncoder(message, channel);
    }.bind(this))));

    this.faders = this.addControl(new ControlGroup(layout.faders.map(function (message, index) {
        var channel = this.drumPadBank.getChannel(index);
        return new TrackVolumeEncoder(message, channel);
    }.bind(this))));

    this.feedbackButtons = this.addControl(new ControlGroup(layout.buttons[1].map(function (message, index) {
        return new DrumPadButton(message, this.drumPadBank, index);
    }.bind(this))));

    this.padSelectors = this.addControl(new DrumPadSelectorButtons({
        previous: layout.navigation.up,
        next: layout.navigation.down
    }, this.drumPadBank));

    // Retry finding drum device when template activated

    this.on('activeChanged', function(active) {
        if (active) {
            this.updateDrumTrackConnection();
            this.drumPadBank.scrollToChannel(DRUM_MIN_PAD_OFFSET);
        }
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
