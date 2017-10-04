function DrumPadButton(message, drumPadBank, index)
{
    Button.call(this, message, Button.TYPE_MOMENTARY);

    this.index = index;
    this.drumScrollOffset = -1;

    this.drumPadBank = drumPadBank;
    this.drumPadBank.addChannelScrollPositionObserver(this.set.bind(this, 'drumScrollOffset'), -1);

    this.channel = drumPadBank.getChannel(index);
    this.connectTrack(this.channel);
    this.channel.addNoteObserver(this.onNote.bind(this));

    this.on('drumScrollOffsetChanged', this.value.setInternal.bind(this, false));
};

util.inherits(DrumPadButton, Button);

DrumPadButton.prototype.onNote = function(isOn, key, velocity) {
    if (key - this.drumScrollOffset == this.index) {
        this.value.setInternal(isOn);
    }
};
