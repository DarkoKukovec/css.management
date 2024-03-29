define([
  'app'
],

function(
    app
  ) {
  'use strict';
  var StyleNode = Backbone.Model.extend({
    defaults: {
      hash: null,
      parentHash: null,
      type: null,
      name: null,
      value: null,
      important: false,
      children: null,
      devices: {},
      enabled: true
    },

    /***
     * Initialization
     ***/

    init: function(style, device, StyleNodes) {
      // Set the basic attributes
      var data = _.omit(style, ['hash', 'children']);
      data.devices = {};
      data.devices[device.get('id')] = style.hash;
      data.enabled = style.enabled !== false;
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

    /***
     * Utils
     ***/

    compare: function(node) {
      // TODO: Find a way to differentiate inline stylesheets (type == -3)
      if (node.name !== this.get('name')) {
        // Nothing else to compare
        return 0;
      }
      if (node.type === -1 && this.get('type') === -1 && !this.valueCompare(node.value)) {
        // The current node is a property and the value is not the same
        return 1;
      }
      if (node.type === -1 && this.get('type') === -4) {
        // The current node is a group and the value is not the same
        return 1;
      }
      if (node.type !== this.get('type')) {
        return 0;
      }

      return 2;
    },

    valueCompare: function(value) {
      // handle cases like "Arial, serif" (Chrome) & "Arial,serif" (Firefox)
      var thisValue = this.get('value') || '';
      value = value.replace(/\s\s/g, ' ').replace(/,\s/g, ',');
      thisValue = thisValue.replace(/\s\s/g, ' ').replace(/,\s/g, ',');
      return value === thisValue;
    },

    isGroupItem: function() {
      return this.parentNode.get('type') === -4;
    },

    isOriginal: function() {
      return this.get('name') === this.get('originalName') &&
        this.get('value') === this.get('originalValue') &&
        this.get('important') === this.get('originalImportant');
    },

    getDevices: function() {
      return _.keys(this.get('devices'));
    },

    isColor: function() {
      return this.get('name').indexOf('color') !== -1;
    },

    /***
     * Data updates
     ***/

    updateStyle: function(style, device) {
      // Update the basic attributes, add the device
      var data = _.omit(style, ['hash', 'children']);
      this.set(data);
      this.addDevice(device, style);

      if (style.children) {
        // Update the children
        this.get('children').updateStyles(device, style.children, this);
      }
    },

    addSimilar: function(style, device, StyleNodes) {
      var children;
      if (this.get('type') === -1) {
        // Move the current property to the new group
        var data = this.toJSON();

        // Make a deep copy of the devices
        data.devices = $.extend(true, {}, this.get('devices'));

        this.set('children', new StyleNodes());
        children = this.get('children');
        children.on('children:change', this.onChildrenRemove, this);
        children.isGroup = true;
        children.add(data);
        children.first().parentNode = this;
        children.first().listenerInit();
        this.set('type', -4);
      } else {
        children = this.get('children');
      }
      var me = this;
      var found = false;
      // Check if there is already a property with the same value
      children.each(function(item) {
        // Check if the item exists - if not, the group was degraded to a property in the meantime
        if (item && item.valueCompare(style.value)) {
          found = true;
          item.updateStyle(style, device);
          me.addDevice(device, style);
        }
      });
      if (!found && children) {
        // Check with the device what values are supported
        app.comm.request('property:check', {
          device: device.get('id'),
          property: style.hash,
          parent: style.parentHash,
          values: children.pluck('value')
        }, function(data) {
          var results = data.results;
          me.addDevice(device, style);
          // TODO: Take the strings results into account
          var pos = results.indexOf(false);
          if (pos === -1) {
            pos = results.length;
          }
          me.get('children').addAt(pos, style, device, me);
        }, this);
      }
    },

    addDevice: function(device, style) {
      var devices = this.get('devices');
      devices[device.get('id')] = style.hash;
      this.trigger('devices:update', this);
    },

    removeDevice: function(device) {
      if (this.get('children')) {
        // Remove the device from children
        this.get('children').removeStyles(device);
      }

      // Remove the device from the node
      var devices = this.get('devices');
      delete devices[device.get('id')];
      this.trigger('devices:update', this);
    },

    onChildrenRemove: function() {
      if (this.get('children').getActiveCount() === 1) {
        var child = this.get('children').first();
        var copy = ['name', 'value', 'important', 'originalName', 'originalValue', 'originalImportant'];
        for (var i = 0; i < copy.length; i++) {
          // Avoid the change event
          this.attributes[copy[i]] = child.get(copy[i]);
          // this.set({copy[i]: child.get(copy[i]) });
        }
        child.destroy();
        // Remove all the listeners to prevent memory leaks
        this.get('children').off('children:change', this.onChildrenRemove, this);
        // If all the listeners are removed, the garbage collector *should* clean this up
        this.set('children', null);
        this.set('type', -1);
      }
    },

    /***
     * UI updates
     ***/

    // TODO: Reorder
    // TODO: PropertyGroup - UI transition from/to property
    // TODO: PropertyGroup - check correct property order

    onNameChange: function() {
      if (!this.get('enabled')) {
        return;
      }

      if (!this.get('name')) {
        // TODO: Remove the property
        return;
      }

      if (!this.get('hash')) {
        // A new node
        var raw = (new Date()).getTime() + '-' + Math.random();
        var hash = window.CryptoJS.SHA1(raw).toString();
        this.set('hash', hash);
        var devices = this.get('parentDevices');
        var nodeDevices = {};
        _.each(devices, function(h, device) {
          nodeDevices[device] = hash;
        });
        this.set('devices', nodeDevices);
        this.addStyle();
        return;
      }

      // TODO: Update property groups
      this.trigger('groups:update', this);

      app.comm.request('change:request', {
        payload: this.getChangePayload('rename')
      }, function(data) {
        // Check if it was successfull
      }, this);
    },

    onValueChange: function() {
      if (!this.get('enabled') || this.get('type') === -4 || !this.get('value')) {
        return;
      }

      // TODO: Try to change the value for the properties before this in the group
      if (this.isGroupItem()) {
        this.trigger('group:change:prev', this);
      }

      app.comm.request('change:request', {
        payload: this.getChangePayload('change')
      }, function(data) {
        // Check if it was successfull
      }, this);
    },

    onToggle: function() {
      if (this.get('enabled')) {
        this.addStyle();
      } else {
        this.removeStyle();
      }
    },

    /***
     * Update utls
     ***/

    addStyle: function() {
      this.onValueChange(this);
    },

    removeStyle: function() {
      app.comm.request('change:request', {
        payload: this.getChangePayload('remove')
      }, function(data) {
        // Check if it was successfull
      }, this);
    },

    getChangePayload: function(action) {
      var model = this;
      var devices = {};

      var parent = this.parentNode;
      if (parent.get('type') === -4) {
        parent = parent.parentNode;
      }

      // Get list of selected devices
      _.each(this.get('devices'), function(hash, device) {
        var d = app.collections.devices.get(device);
        if (d.get('selected')) {
          devices[device] = {
            hash: hash,
            parentHash: parent.get('devices')[device],
            type: model.get('type'),
            oldName: model.previous('name'),
            name: model.get('name'),
            value: model.get('value'),
            important: model.get('important'),
            action: action
          };
        }
      });

      return devices;
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