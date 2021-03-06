var DRUM_CHANNEL = 0;
var DRUM_MIN_PAD_OFFSET = 36;
var DRUM_MAX_PAD_OFFSET = 44;

load('src/drum/DrumPadButton.js');
load('src/drum/DrumPadSelectorButtons.js');

function DrumMachine()
{
    ControlGroup.call(this);

    this._encoderMode = 'pan';

    this.selectedChannel = 0;
    this.on('selectedChannelChanged', this.selectedChannelChanged.bind(this));

    this.trackBank = host.createMainTrackBank(8, 0, 0);
    this.trackBank.addChannelCountObserver(this.updateDrumTrackConnection.bind(this));

    this.cursorTrack = host.createCursorTrack("DrumMachine", 2, 0);
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

    var ledColumns = layout.leds[0].map(function (_, colIndex) {
        return layout.leds.map(function (row, _) { return row[colIndex]; });
    });

    this.deviceLeds = this.addControl( new ControlGroup(ledColumns.map(function (messages, colIndex) {
        var channel = this.drumPadBank.getChannel(colIndex);
        var device = channel.createDeviceBank(1).getDevice(0);
        return new ControlGroup(messages.map(function (message, rowIndex) {
            return new DeviceParameterLed(message, 15 /*red*/, Colors.Device.NoDevice, device, rowIndex);
        }.bind(this)));
    }.bind(this)))).set('active', false);

    var encoderColumns = layout.encoders[0].map(function (_, colIndex) {
        return layout.encoders.map(function (row, _) { return row[colIndex]; });
    });

    this.deviceEncoders = this.addControl(new ControlGroup(encoderColumns.map(function (messages, colIndex) {
        var channel = this.drumPadBank.getChannel(colIndex);
        var device = channel.createDeviceBank(1).getDevice(0);
        return new ControlGroup(messages.map(function(message, rowIndex) {
            return new DeviceParameterEncoder(message, device, rowIndex);
        }.bind(this)));
    }.bind(this)))).set('active', false);

    this.faders = this.addControl(new ControlGroup(layout.faders.map(function (message, index) {
        var channel = this.drumPadBank.getChannel(index);
        return new TrackVolumeEncoder(message, channel);
    }.bind(this))));

    this.feedbackButtons = this.addControl(new ControlGroup(layout.buttons[0].map(function (message, index) {
        return new DrumPadButton(message, this.drumPadBank, index);
    }.bind(this))));

    this.padSelectors = this.addControl(new DrumPadSelectorButtons({
        previous: layout.navigation.up,
        next: layout.navigation.down
    }, this.drumPadBank));

    this.modeDeviceButton = this.addControl(new Button(layout.navigation.device))
        .on('tap', this.toggleEncoderMode.bind(this));

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

DrumMachine.prototype.toggleEncoderMode = function () {
    this._encoderMode = this._encoderMode === 'pan' ? 'device' : 'pan';
    this.switchEncoderMode(this._encoderMode);
};

DrumMachine.prototype.switchEncoderMode = function (mode) {

    host.showPopupNotification('Encoder Mode: ' + ({'device': 'Drum Voice Parameters', 'pan': 'Sends/Panning', device: 'Drum Device Params'})[mode]);

    this._encoderMode = mode;

    this.modeDeviceButton.value.setInternal(mode === 'device');

    this.sends.set('active', mode === 'pan');
    this.sendLeds.set('active', mode === 'pan');
    this.pans.set('active', mode === 'pan');
    this.panLeds.set('active', mode === 'pan');

    this.deviceLeds.set('active', mode === 'device');
    this.deviceEncoders.set('active', mode === 'device');
};
