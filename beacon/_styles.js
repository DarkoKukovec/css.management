var Styles = {
  all: [],
  map: {},
  nodes: {},
  getAll: function() {
    var sheets = Styles.sheets.getAll();
    Styles.calculateHashes(sheets);
    return sheets;
  },
  calculateHashes: function(nodes) {
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      node.parentHash = null;
      if ('parent' in node && node.parent) {
        node.parentHash = node.parent.hash;
      }

      var key = i + '$' + node.parentHash + '$' + node.name;
      node.hash = CryptoJS.SHA1(key).toString();
      Styles.map[node.hash] = node;

      if ('children' in node) {
        Styles.calculateHashes(node.children);
      }
    }
  }
};