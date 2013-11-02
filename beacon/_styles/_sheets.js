Styles.sheets = {
  getAll: function() {
    var sheets = [];
    // There is probably a better way to get style and link tags in order
    var sheetList = document.styleSheets;
    for (var i = 0; i < sheetList.length; i++) {
      var node = sheetList[i];
      var sheet = {
        ref: node,
        type: node.href ? -2 : -3,
        name: node.href,
        parent: null,
        children: []
      };

      var rules = node.cssRules || node.rules;
      for (var j = 0; j < rules.length; j++) {
        var style = Styles.types.get(rules[j], sheet);
        if (style) {
          sheet.children.push(style);
        }
      }

      sheets.push(sheet);
    }

    return sheets;
  }
};