Styles.nodes.properties = {
  get: function(node, parent) {
    var properties = [];

    for (var i = 0; i < node.length; i++) {
      var property = {
        type: -1,
        name: node[i],
        value: node.getPropertyValue(node[i]),
        important: node.getPropertyPriority && node.getPropertyPriority(node[i]) === 'important',
        parent: parent
      };
      properties.push(property);
    }

    return properties;
  },
  rename: function(data) {
    var parent = Styles.map[data.parentHash].ref;
    var style = parent.style || parent.cssStyle;
    if (style.removeProperty) {
      style.removeProperty(data.name);
    } else {
      style[Utils.toCamelCase(data.name)] = null;
    }
    if (style.setProperty) {
      style.setProperty(data.name, data.value);
    } else {
      style[Utils.toCamelCase(data.name)] = data.value;
    }
    var next = style.getPropertyValue ? style.getPropertyValue(data.name) : style[Utils.toCamelCase(data.name)];
    Connection.send('change:response', {
      hash: data.hash,
      data: data,
      newValue: next,
      change: !!next
    });
  },
  change: function(data) {
    var parent = Styles.map[data.parentHash].ref;
    var style = parent.style || parent.cssStyle;
    var prev = style.getPropertyValue ? style.getPropertyValue(data.name) : style[Utils.toCamelCase(data.name)];
    if (style.setProperty) {
      style.setProperty(data.name, data.value);
    } else {
      style[Utils.toCamelCase(data.name)] = data.value;
    }
    var next = style.getPropertyValue ? style.getPropertyValue(data.name) : style[Utils.toCamelCase(data.name)];
    Connection.send('change:response', {
      hash: data.hash,
      data: data,
      oldValue: prev,
      newValue: next,
      change: prev !== next
    });
  }
};