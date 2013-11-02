var Change = {
  exec: function(data) {
    // changeId, hash, parentHash, type, name, value, action
    Styles.nodes[Styles.types.list[data.type]][data.action](data);
  }
};