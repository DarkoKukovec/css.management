Styles.nodes.media = {
  get: function(node, parent) {
    // Utils.log('media', node);
    var media = {
      ref: node,
      type: node.type,
      name: node.media.mediaText,
      parent: parent,
      children: []
    };

    var rules = node.cssRules || node.rules;
    for (var i = 0; i < rules.length; i++) {
      var style = Styles.types.get(rules[i], media);
      if (style) {
        media.children.push(style);
      }
    }

    return media;
  }
};