define([
  'models/styleNode'
],

function(
    StyleNode
  ) {
  'use strict';
  var StyleNodes = Backbone.Collection.extend({
    model: StyleNode,

    updateStyles: function(device, styles, parent) {
      var lastAddedIndex = -1;
      for (var i = 0; i < styles.length; i++) {
        var found = 0;
        for (var j = 0; j < this.size(); j++) {
          var node = this.at(j);
          var diff = node.compare(styles[i]);
          if (diff === 1) {
            found = 1;
            node.addSimilar(styles[i], device, StyleNodes);
          } else if (diff === 2) {
            // Add the device to the node and update the node
            node.updateStyle(styles[i], device);
            lastAddedIndex = j;
            found = 2;
            break;
          }
        }
        if (found === 0) {
          // Add a new node at lastAddedIndex + 1
          lastAddedIndex++;
          this.addAt(lastAddedIndex, styles[i], device, parent);
        }
      }
    },

    hasValue: function(needle) {
      var found = false;
      this.each(function(item) {
        found |= item.valueCompare(needle);
      });
      return found;
    },

    removeStyles: function(device, styles) {
      for (var j = 0; j < this.size(); j++) {
        // Remove the device from the style
        var node = this.at(j);
        node.removeDevice(device);
      }
    },

    addAt: function(index, target, device, parent) {
      var item = new StyleNode({hash: target.hash});
      item.init(target, device, StyleNodes);
      item.parentNode = parent;
      this.add(item, {at: index});
    }
  });

  return StyleNodes;
});