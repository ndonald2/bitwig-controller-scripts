function DrumPadSelectorButtons(midiMessages, padBank)
{
    ControlGroup.call(this);
    this.padBank = padBank;
    this._previous = this.addControl(new Button(midiMessages.previous)).on('press', this.previous.bind(this));
    this._next = this.addControl(new Button(midiMessages.next)).on('press', this.next.bind(this));

    this.canGoUp = false;
    this.canGoDown = false;

    this.on('canGoDownChanged', this._next.value.setInternal);
    this.on('canGoUpChanged', this._previous.value.setInternal);

    this.padBank.addChannelScrollPositionObserver(function (position) {
        this.set('canGoDown', position > DRUM_MIN_PAD_OFFSET);
        this.set('canGoUp', position < DRUM_MAX_PAD_OFFSET);
    }.bind(this), -1);
}

util.inherits(DrumPadSelectorButtons, ControlGroup);

// The API nomenclature for up/down is reversed from the button UI
//
DrumPadSelectorButtons.prototype.next = function () {
    if (!this.canGoDown) { return; }
    this.padBank.scrollChannelsPageUp();
};

DrumPadSelectorButtons.prototype.previous = function () {
    if (!this.canGoUp) { return; }
    this.padBank.scrollChannelsPageDown();
};
