Object.prototype.each = function(callback) {
  for (var key in this) {
    if (this.hasOwnProperty(key)) {
      callback(this[key], key);
    }
  }
};