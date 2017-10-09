function Value()
{
    EventEmitter.call(this);

    this.internalValue = 0;
    this.externalValue = 0;

    this.lastExternalChangeTime = 0;

    this.setMode = this.setMode.bind(this);
    this.setMode('Pickup');

    if (!Value.modeSetting) {
      Value.modeSetting = host.getPreferences().getEnumSetting('Value Mode', 'Encoder', ['Direct', 'Pickup', 'Scale'], 'Direct');
    }

    Value.modeSetting.addValueObserver(this.setMode);
}

util.inherits(Value, EventEmitter);

Value.prototype.max = 127;

Value.prototype.getInternal = function()
{
    return this.internalValue;
};
Value.prototype.setMode = function(mode)
{
    var Mode = (Value.Mode[mode] || Value.Mode.Pickup);

    this.setInternal = Mode.setInternal.bind(this);
    this.setExternal = Mode.setExternal.bind(this);
    this.isReady = Mode.isReady.bind(this);
};
Value.prototype.showPickupIndicator = function (value)
{
  var isAboveTarget = (value > this.internalValue);
  var lower = isAboveTarget ? this.internalValue : 0;
  var upper = isAboveTarget ? this.max : this.internalValue;
  var scaleIdx = Math.round(((value - lower) / (upper - lower)) * 15.0);

  var notification = "Pickup : [";
  var bars = "----------------";
  var indicatorBars = bars.substr(0, scaleIdx) + "0" + bars.substr(scaleIdx + 1);

  if (isAboveTarget) {
      notification = notification + bars + "|";
      notification = notification + indicatorBars + "]";
  } else {
      notification = notification + indicatorBars + "|";
      notification = notification + bars + "]";
  }
  host.showPopupNotification(notification);
};
Value.prototype._isControllingExternally = function ()
{
    var d = new Date();
    return d.getTime() - this.lastExternalChangeTime < 100;
};

Value.Mode = {};

Value.Mode.Direct = {};
Value.Mode.Direct.setInternal = function(value)
{
    this.internalValue = value;
    this.externalValue = value;
    this.emit('change', this.internalValue);

    return this;
};
Value.Mode.Direct.setExternal = function(value)
{
    this.externalValue = value;
    this.internalValue = value;
    return this;
};
Value.Mode.Direct.isReady = function ()
{
    return true;
};

Value.Mode.Pickup = {};
Value.Mode.Pickup.THRESHOLD = 2.0;
Value.Mode.Pickup.setInternal = function(value)
{
    if (this._isControllingExternally()) {
        return;
    }
    this.internalValue = value;
    this.emit('change', this.internalValue);
    return this;
};
Value.Mode.Pickup.setExternal = function(value)
{
    var d = new Date();
    this.lastExternalChangeTime = d.getTime();

    var diff = Math.abs(value - this.internalValue);
    if (diff <= Value.Mode.Pickup.THRESHOLD) {
        this.internalValue = value;
    } else {
        this.showPickupIndicator(value);
    }
    this.externalValue = value;

    return this;
};
Value.Mode.Pickup.isReady = function() {
  return this.internalValue === this.externalValue;
};

Value.Mode.Scale = {};
Value.Mode.Scale.setInternal = function(value)
{
    this.internalValue = value;
    this.emit('change', this.internalValue);
    return this;
};
Value.Mode.Scale.setExternal = function(value)
{
    var externalValue = this.externalValue,
        internalValue = this.internalValue,
        max = this.max;

    var diff = internalValue - externalValue;

    if (diff < 0) {
        diff *= -1;
    }

    if (diff < 2) {
        internalValue = value;
    } else if (externalValue) {


        var scale = (value > externalValue) ? (max - externalValue) : (externalValue);
        var moveDiff = value - externalValue;
        var increment = moveDiff / scale * diff;

        internalValue += increment;

        if (value < 0) {
            internalValue = 0;
        } else if (value > max) {
            internalValue = max;
        }

    }

    this.internalValue = internalValue;
    this.externalValue = value;

    return this;
};
Value.Mode.Scale.isReady = function ()
{
    return true;
};
