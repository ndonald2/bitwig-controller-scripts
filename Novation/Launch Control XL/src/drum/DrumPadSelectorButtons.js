function DrumPadSelectorButtons(midiMessages, padBank)
{
    ControlGroup.call(this);
    this.padBank = padBank;
    this._previous = this.addControl(new Button(midiMessages.previous)).on('press', this.previous.bind(this));
    this._next = this.addControl(new Button(midiMessages.next)).on('press', this.next.bind(this));
    this.padBank.addCanScrollChannelsDownObserver(this._previous.value.setInternal);
    this.padBank.addCanScrollChannelsUpObserver(this._next.value.setInternal);
}

util.inherits(DrumPadSelectorButtons, ControlGroup);

DrumPadSelectorButtons.prototype.next = function ()
{
    this.padBank.scrollChannelsPageUp();
};

DrumPadSelectorButtons.prototype.previous = function ()
{
    this.padBank.scrollChannelsPageDown();
};
