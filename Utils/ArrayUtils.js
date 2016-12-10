// Removal by value (all instances)
Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

// Whether array is empty
Array.prototype.isEmpty = function() {
  return this.length == 0;
};

// Last element or null if empty
Array.prototype.last = function() {
  if (this.isEmpty()) {
    return null;
  }
  return this[this.length - 1];
};
