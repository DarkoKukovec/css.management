Styles.nodes.properties = {
  get: function(node, parent) {
    var properties = [];

    for (var i = 0; i < node.length; i++) {
      var property = {
        type: -1,
        name: node[i],
        value: node.getPropertyValue(node[i]),
        important: node.getPropertyPriority && node.getPropertyPriority(node[i]) === 'important',
        parent: parent,
        enabled: true
      };
      properties.push(property);
    }

    return properties;
  },

  rename: function(data) {
    var parent = Styles.map[data.parentHash].ref;
    var style = parent.style || parent.cssStyle;
    if (style.removeProperty) {
      style.removeProperty(data.oldName);
    } else {
      style[Utils.toCamelCase(data.oldName)] = null;
    }
    if (style.setProperty) {
      style.setProperty(data.name, data.value, data.important ? 'important' : null);
    } else {
      // TODO: !important
      style[Utils.toCamelCase(data.name)] = data.value;
    }
    var next = style.getPropertyValue ? style.getPropertyValue(data.name) : style[Utils.toCamelCase(data.name)];
    Connection.send('change:response', {
      hash: data.hash,
      data: data,
      newValue: next,
      change: !!next,
      requestId: data.requestId,
      enabled: true
    });
  },
  change: function(data) {
    var parent = Styles.map[data.parentHash].ref;
    var style = parent.style || parent.cssStyle;
    var prev = style.getPropertyValue ? style.getPropertyValue(data.name) : style[Utils.toCamelCase(data.name)];
    // First remove the old property to override !important
    if (style.removeProperty) {
      style.removeProperty(data.name);
    } else {
      style[Utils.toCamelCase(data.name)] = null;
    }
    if (style.setProperty) {
      style.setProperty(data.name, data.value, data.important ? 'important' : null);
    } else {
      // TODO: !important
      style[Utils.toCamelCase(data.name)] = data.value;
    }
    var next = style.getPropertyValue ? style.getPropertyValue(data.name) : style[Utils.toCamelCase(data.name)];
    if (next === '' && next !== prev) {
      if (style.setProperty) {
        style.setProperty(data.name, prev, data.important ? 'important' : null);
      } else {
        // TODO: !important
        style[Utils.toCamelCase(data.name)] = prev;
      }
      next = prev;
    }
    Connection.send('change:response', {
      hash: data.hash,
      data: data,
      oldValue: prev,
      newValue: next,
      change: prev !== next,
      requestId: data.requestId,
      enabled: true
    });
  },
  remove: function(data) {
    var parent = Styles.map[data.parentHash].ref;
    var style = parent.style || parent.cssStyle;
    if (style.removeProperty) {
      style.removeProperty(data.name);
    } else {
      style[Utils.toCamelCase(data.name)] = null;
    }

    var next = style.getPropertyValue ? style.getPropertyValue(data.name) : style[Utils.toCamelCase(data.name)];
    Connection.send('change:response', {
      hash: data.hash,
      data: data,
      newValue: next,
      change: !next,
      requestId: data.requestId,
      enabled: false
    });
  }
};