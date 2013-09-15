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
      // TODO: Find a way to differentiate inline stylesheets (type == -3)
      if (node.name != this.get('name')) {
        return 0;
      }
      if (node.type == -1 && node.value != this.get('value')) {
        // Both are properties with the same name, but not with the same value
        // Order has to be checked (in collection)
        return 1;
      }

      return 2;
    },

    init: function(style, device, StyleNodes) {
      // Set the basic attributes
      var data = _.omit(style, ['hash', 'children']);
      data.devices = {};
      data.devices[device.get('id')] = style.hash;
      this.set(data);

      if (style.children) {
        // Create the children
        var children = new StyleNodes();
        children.updateStyles(device, style.children);
        this.set('children', children);
      }
    },

    updateStyle: function(style, device) {
      // Update the basic attributes, add the device
      var data = _.omit(style, ['hash', 'children']);
      this.set(data);
      var devices = this.get('devices');
      devices[device.get('id')] = style.hash;
      // The change event isn't triggered?
      this.set('devices', devices).trigger('change:devices');

      if (style.children) {
        // Update the children
        this.get('children').updateStyles(device, style.children);
      }
    },

    removeDevice: function(device) {
      // Remove the device from the node
      var devices = this.get('devices');
      delete devices[device.get('id')];
      // The change event isn't triggered?
      this.set('devices', devices).trigger('change:devices');

      if (this.get('children')) {
        // Remove the device from children
        this.get('children').removeStyles(device);
      }
    }
  });

  return StyleNode;
});