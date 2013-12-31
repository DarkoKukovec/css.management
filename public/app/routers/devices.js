define([
  'app'
],

function(
    app
  ) {
  'use strict';
  var Router = Backbone.Router.extend({

    updating: {},

    onAdd: function(data) {
      console.log('New device', data);
      var device = app.collections.devices.get(data.id);
      if (device) {
        device.set('connected', true);
      } else {
        app.collections.devices.add({
          id: data.id,
          platform: data.platform,
          connected: true,
          style: data.style
        });
        device = app.collections.devices.get(data.id);
      }
      this.updateStyles(device, data.style);
    },

    onRemove: function(data) {
      console.log('Device gone', data.id);
      var device = app.collections.devices.get(data.id);
      if (device.get('connectionId') !== data.connectionId) {
        // When refreshing a device, it foten emmits the add event before the disconnect event
        // In that case, the disconnect event should be ignored
        return;
      }
      device.set('connected', false);
      this.updateStyles(device, device.get('style'));
    },

    updateStyles: function(device, style) {
      // If a device wants to update it styles more than once,
      // let the current update finish and then refresh it with the last requested update
      var id = device.get('id');
      if (this.updating[id]) {
        var me = this;
        this.updating = function() {
          me.updateStyles(device, style, id);
        };
        return;
      }
      this.updating[id] = true;
      app.collections.files.updateStyles(device, style);
      if (typeof this.updating[id] === 'function') {
        this.updating[id].call(this);
      }
      this.updating[id] = false;
    }

  });

  return Router;

});