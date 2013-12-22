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

    defaults: {
      enabled: true
    },

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

      this.set({
        originalName: data.name,
        originalValue: data.value,
        originalImportant: data.important
      });

      if (style.children) {
        // Create the children
        var children = new StyleNodes();
        children.updateStyles(device, style.children, this);
        this.set('children', children);
      }
      this.on('change:name', this.onNameChange, this);
      this.on('change:value', this.onValueChange, this);
      this.on('change:important', this.onValueChange, this);
      this.on('change:enabled', this.onToggle, this);
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
        this.get('children').updateStyles(device, style.children, this);
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
    },

    // TODO: Add
    // TODO: Remove
    // TODO: Toggle
    // TODO: Reset
    // TODO: Reorder

    onNameChange: function(model, value) {
      if (!model.get('enabled')) {
        return;
      }
      var changeId = model.get('hash') + '-' + (new Date()).getTime();
      var devices = {};
      _.each(model.get('devices'), function(hash, device) {
        var d = app.collections.devices.get(device);
        if (d.get('selected')) {
          devices[device] = {
            changeId: changeId,
            hash: hash,
            parentHash: model.parentNode.get('devices')[device],
            type: model.get('type'),
            oldName: model.previous('name'),
            name: model.get('name'),
            value: model.get('value'),
            action: 'rename'
          };
        }
      });
      // Get list of selected devices
      app.socket.emit('change:request', {
        session: app.data.session,
        payload: devices
      });
    },

    onValueChange: function(model) {
      if (!model.get('enabled')) {
        return;
      }
      // TODO: Try to change the value for the properties before this with the same name
      // TODO: Add a handler for the changeId to see what changed
      console.log(model.get('name') + ':', model.get('value'), model.get('important') ? '!important;' : ';');
      var changeId = model.get('hash') + '-' + (new Date()).getTime();
      var devices = {};
      _.each(model.get('devices'), function(hash, device) {
        var d = app.collections.devices.get(device);
        if (d.get('selected')) {
          devices[device] = {
            changeId: changeId,
            hash: hash,
            parentHash: model.parentNode.get('devices')[device],
            type: model.get('type'),
            name: model.get('name'),
            value: model.get('value'),
            important: model.get('important'),
            action: 'change'
          };
        }
      });
      // Get list of selected devices
      app.socket.emit('change:request', {
        session: app.data.session,
        payload: devices
      });
    },

    onToggle: function() {
      if (this.get('enabled')) {
        this.addStyle();
      } else {
        this.removeStyle();
      }
    },

    addStyle: function() {
      this.onValueChange(this);
    },

    removeStyle: function() {
      var model = this;
      var changeId = model.get('hash') + '-' + (new Date()).getTime();
      var devices = {};
      _.each(model.get('devices'), function(hash, device) {
        var d = app.collections.devices.get(device);
        if (d.get('selected')) {
          devices[device] = {
            changeId: changeId,
            hash: hash,
            parentHash: model.parentNode.get('devices')[device],
            type: model.get('type'),
            name: model.get('name'),
            value: model.get('value'),
            important: model.get('important'),
            action: 'remove'
          };
        }
      });
      // Get list of selected devices
      app.socket.emit('change:request', {
        session: app.data.session,
        payload: devices
      });
    },

    isOriginal: function() {
      return this.get('name') == this.get('originalName') &&
        this.get('value') == this.get('originalValue') &&
        this.get('important') == this.get('originalImportant');
    },

    resetData: function() {
      this.set({
        name: this.get('originalName'),
        value: this.get('originalValue'),
        important: this.get('originalImportant')
      });
    }
  });

  return StyleNode;
});