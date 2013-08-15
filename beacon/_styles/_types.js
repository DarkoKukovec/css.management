Styles.types = {
  list: {
    // http://wiki.csswg.org/spec/cssom-constants
    // 0: 'unknown',
    1: 'style',
    // 2: 'charset',
    // 3: 'import',
    4: 'media',
    // 5: 'fontFace',
    // 6: 'page',
    // 7: 'keyframes',
    // 8: 'keyframe',
    // 9 - **reserved** (color profile, svg/css4)
    // 10: 'namespace',
    // 11: 'counterStyle',
    // 12: 'supports',
    // 13: 'document',
    // 14: 'fontFeatureValues',
    // 15: 'viewport',
    // 16: 'regionStyle',
    // 1000: 'textTransform',
    // 1001: 'host'

    '-1': 'properties'
    // -2 - sheet - file
    // -3 - sheet - inline
  },
  get: function(node, parent) {
    var type = node.type;
    if (Styles.types.list[type]) {
        return Styles.nodes[Styles.types.list[type]].get(node, parent);
    }
  }
};