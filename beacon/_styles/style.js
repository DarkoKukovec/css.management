Styles.nodes.style = {
  get: function(node, parent) {
    Utils.log('style', node);
    var style = {
      ref: node,
      type: node.type,
      name: node.selectorText,
      parent: parent
    };

    style.children = Styles.nodes.properties.get(node.style, style);

    return style;
  }
};