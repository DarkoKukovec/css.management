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
  }
};