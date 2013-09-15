define([
  'app'
],

function(
    app
  ) {
  'use strict';
  var StyleNode = Backbone.Model.extend({
    idAttribute: 'hash',
    // (string identity) hash
    // (string) parentHash
    // (int) type
    // (string) name
    // (string) value (property)
    // (boolean) important (property)
    // (StyleNodes collection) children (!property)
    // (object) devices
    //   (string) device_id : (string) device_node_id

    compare: function(node) {
      if (node.type != this.get('type')) {
        return 0;
      }
      if (node.name != this.get('name')) {
        return 0;
      }
      if (node.type == -1 && node.value != this.get('value')) {
        // Both are properties with the same name, but not with the same value
        // Order has to be checked
        return 1;
      }

      return 2;
    }
  });

  return StyleNode;
});