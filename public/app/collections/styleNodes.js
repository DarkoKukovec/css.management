define([
  'models/styleNode'
],

function(
    StyleNode
  ) {
  'use strict';
  var StyleNodes = Backbone.Collection.extend({
    model: StyleNode,

    updateStyles: function(device, styles) {
      var lastAddedIndex = -1;
      for (var i = 0; i < styles.length; i++) {
        var found = 0;
        var similar = [];
        for (var j = 0; j < this.size(); j++) {
          var node = this.at(j);
          var diff = node.compare(styles[i]);
          if (diff == 2) {
            // Add the device to the node and update the node
            node.updateStyle(styles[i], device);
            lastAddedIndex = j;
            found = 2;
            break;
          } else if (diff == 1) {
            found = 1;
            similar.push(node);
          } else if (diff === 0 && found == 1) {
            // TODO: Determine the order based on similar[]
            lastAddedIndex = j - 1;
            break;
          }
        }
        if (found === 0) {
          // Add a new node at lastAddedIndex + 1
          lastAddedIndex++;
          this.addAt(lastAddedIndex, styles[i], device);
        }
      }
    },

    removeStyles: function(device, styles) {
      for (var j = 0; j < this.size(); j++) {
        // Remove the device from the style
        var node = this.at(j);
        node.removeDevice(device);
      }
    },

    addAt: function(index, target, device) {
      var item = new StyleNode({hash: target.hash});
      item.init(target, device, StyleNodes);
      this.add(item, {at: index});
    }
  });

  return StyleNodes;
});