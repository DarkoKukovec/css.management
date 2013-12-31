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
  },

  rename: function(data) {
    var parent = Styles.map[data.parentHash].ref;
    var media = Styles.map[data.hash].ref;

    console.log(media);
    var prev = media.media.mediaText;
    media.media.mediaText = data.name;
    var next = media.media.mediaText;

    Connection.send('change:response', {
      hash: data.hash,
      data: data,
      newValue: next,
      change: next === data.oldName || (next != prev ? next : false),
      requestId: data.requestId
    });
  }
};