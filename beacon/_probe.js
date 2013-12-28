var Probe = {
  check: function(data) {
    var parent = Styles.map[data.parent].ref;
    var style = parent.style || parent.cssStyle;
    var original = Probe.getValue(style, data.name);
    var prev = original;
    var response = [];
    for (var i = 0; i < data.values.length; i++) {
      var next = Probe.setValue(style, data.name, data.values[i]);
      if (next === data.values[i]) {
        response.push(true);
      } else if (next === prev) {
        response.push(false);
      } else {
        response.push(next);
      }
      prev = next;
    }
    Probe.setValue(style, data.name, original);
    Connection.send('property:check:response', {
      results: response,
      session: data.session,
      checkId: data.checkId,
    });
  },
  getValue: function(style, name) {
    return style.getPropertyValue ? style.getPropertyValue(name) : style[Utils.toCamelCase(name)];
  },
  setValue: function(style, name, value) {
    if (style.setProperty) {
      style.setProperty(name, value);
    } else {
      style[Utils.toCamelCase(name)] = value;
    }
    return Probe.getValue(style, name);
  }
};