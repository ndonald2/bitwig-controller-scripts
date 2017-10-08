function Encoder(midiMessage)
{
    Control.call(this, midiMessage);
    this.on('trigger', this._handleTrigger.bind(this));
}

util.inherits(Encoder, Control);

Encoder.prototype._handleTrigger = function (status, data1, value)
{
    this.value.setExternal(value);
    if (this.value.isReady()) {
        this.emit('valueChanged', this.value.internalValue);
    }
};

/**
 * @param {AutomatableRangedValue} parameter
 */
Encoder.prototype.connectParameter = function (parameter)
{
    Control.prototype.connectParameter.call(this, parameter);
    this.on('valueChanged', function (value) {
        parameter.set(value, this.resolution);
    }.bind(this));
    return this;
};

/**
 *
 * @param {BooleanValue} booleanValue
 * @returns {Control}
 */
Encoder.prototype.connectSwitch = function (booleanValue)
{
    Control.prototype.connectSwitch.call(this, booleanValue);
    this.on('trigger', function (value)
    {
        booleanValue.set(value === this.trueValue);
    }.bind(this));
    return this;
};












