define([
  'app'
],

function(
    app
  ) {
  'use strict';
  var StyleNode = Backbone.Model.extend({
    // idAttribute: 'hash',
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
      // TODO: Needs refactoring
      // TODO: Find a way to differentiate inline stylesheets (type == -3)
      if (node.name !== this.get('name')) {
        return 0;
      }
      console.log(this.attributes, node)
      if (node.type != this.get('type')) {
        if (node.type === -1 && this.get('type') === -4 && node.name === this.get('name') && !this.valueCompare(node.value)) {
          return 1;
        }
        return 0;
      }
      if (node.type === -1 && !this.valueCompare(node.value)) {
        return 1;
      }

      return 2;
    },

    isGroupItem: function() {
      return this.parentNode.get('type') === -4;
    },

    valueCompare: function(value) {
      // handle cases like "Arial, serif" (Chrome) & "Arial,serif" (Firefox)
      var thisValue = this.get('value');
      value = value.replace(/\s\s/g, ' ').replace(/,\s/g, ',');
      thisValue = thisValue.replace(/\s\s/g, ' ').replace(/,\s/g, ',');
      console.log(value, thisValue);
      return value === thisValue;
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
      this.listenerInit();
    },

    listenerInit: function() {
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

    addSimilar: function(style, device, StyleNodes) {
      // TODO: Needs refactoring
      var children;
      if (this.get('type') === -1) {
        var data = this.toJSON();
        var nodeDevices = this.get('devices');
        data.devices = {};
        _.each(nodeDevices, function(hash, id) {
          data.devices[id] = hash;
        });
        this.set('type', -4);
        this.set('children', new StyleNodes());
        children = this.get('children');
        children.add(data);
        children.first().parentNode = this;
        children.first().listenerInit();
        console.log(this.get('name'), this.get('value'), 'current');
      } else {
        children = this.get('children');
      }
      var me = this;
      var found = false;
      children.each(function(item) {
        if (item.valueCompare(style.value)) {
          found = true;
          item.updateStyle(style, device);
        }
      });
      if (!found) {
        app.router.propertyCheck(device, style, children.pluck('value'), function(results) {
          var devices = me.get('devices');
          devices[device.get('id')] = style.hash;
          // TODO: Take the strings results into account
          var pos = results.indexOf(false);
          if (pos === -1) {
            pos = results.length;
          }
          // The change event isn't triggered?
          me.set('devices', devices).trigger('change:devices');
          me.get('children').addAt(pos, style, device, me);
            console.log(me.get('name'), style.value, 'new', results, pos);
        }, this);
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
    // TODO: Reorder
    // TODO: PropertyGroup - UI transition from/to property
    // TODO: PropertyGroup - check correct property order

    onNameChange: function(model, value) {
      if (!model.get('enabled')) {
        return;
      }

      // TODO: Update property groups
      this.trigger('groups:update', model);

      var parent = model.parentNode;
      if (parent.get('type') === -4) {
        parent = parent.parentNode;
      }

      var changeId = model.get('hash') + '-' + (new Date()).getTime();
      var devices = {};
      _.each(model.get('devices'), function(hash, device) {
        var d = app.collections.devices.get(device);
        if (d.get('selected')) {
          devices[device] = {
            changeId: changeId,
            hash: hash,
            parentHash: parent.get('devices')[device],
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
      if (!model.get('enabled') || model.get('type') === -4) {
        return;
      }

      // TODO: Try to change the value for the properties before this in the group
      if (this.isGroupItem()) {
        this.trigger('group:change:prev', model);
      }

      var parent = model.parentNode;
      if (parent.get('type') === -4) {
        parent = parent.parentNode;
      }

      console.log(model.get('name') + ':', model.get('value'), model.get('important') ? '!important;' : ';');
      var changeId = model.get('hash') + '-' + (new Date()).getTime();
      // Get list of selected devices
      var devices = {};
      _.each(model.get('devices'), function(hash, device) {
        var d = app.collections.devices.get(device);
        if (d.get('selected')) {
          devices[device] = {
            changeId: changeId,
            hash: hash,
            parentHash: parent.get('devices')[device],
            type: model.get('type'),
            name: model.get('name'),
            value: model.get('value'),
            important: model.get('important'),
            action: 'change'
          };
        }
      });

      // TODO: Add a handler for the changeId to see what changed
      app.router.changeRequest({
        changeId: changeId,
        session: app.data.session,
        payload: devices
      }, function(data) {
        console.log('change:response', model, data);
      }, this);
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

    isColor: function() {
      return this.get('name').indexOf('color') !== -1;
    },

    resetData: function() {
      this.set({
        name: this.get('originalName'),
        value: this.get('originalValue'),
        important: this.get('originalImportant')
      });
    },

    getDevices: function() {
      return _.keys(this.get('devices'));
    }
  });

  return StyleNode;
});