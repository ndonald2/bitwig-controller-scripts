function DrumPadButton(message, drumPadBank, index)
{
    Button.call(this, message);

    this.index = index;
    this.drumScrollOffset = -1;

    this.drumPadBank = drumPadBank;
    this.drumPadBank.addChannelScrollPositionObserver(this.set.bind(this, 'drumScrollOffset'), -1);

    this.channel = drumPadBank.getChannel(index);
    this.connectTrack(this.channel);
    this.channel.addNoteObserver(this.onNote.bind(this));
};

util.inherits(DrumPadButton, Button);

DrumPadButton.prototype.onNote = function(isOn, key, velocity) {
    if (key - this.drumScrollOffset == this.index) {
        this.value.setInternal(isOn);
    }
};
