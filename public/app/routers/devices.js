define([
  'app'
],

function(
    app
  ) {
  'use strict';
  var Router = Backbone.Router.extend({

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

      // When going trough the styles, references to the device have to be removed
      // for every style that this device doesn't contain anymore
      app.collections.files.updateStyles(device, data.style);
    },

    onRemove: function(deviceId) {
      console.log('Device gone', deviceId);
      var device = app.collections.devices.get(deviceId);
      device.set('connected', false);

      // for every item that references the disconnected device
      // The reference has to stay in order to be able to reapply the styles on refresh
      app.collections.files.removeStyles(device, device.get('style'));
    }

  });

  return Router;

});