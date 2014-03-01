var Change = {
  exec: function(data) {
    // changeId, hash, parentHash, type, name, value, action
    if (Styles.types.list[data.type] && Styles.nodes[Styles.types.list[data.type]][data.action]) {
      Styles.nodes[Styles.types.list[data.type]][data.action](data);
    }
  }
};