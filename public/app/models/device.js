define([
  'app'
],

function(
    app
  ) {
  'use strict';
  var Device = Backbone.Model.extend({
    initialize: function() {
      this.on('change:id, reset', function() {
        this.set('name', this.get('nickname') || this.get('id'));
      });
      this.on('change:nickname', function() {
        if (this.get('nickname')) {
          app.setSettings('device-' + this.get('id'), this.get('nickname'));
        } else {
          app.removeSettings('device-' + this.get('id'));
        }
        this.set('name', this.get('nickname') || this.get('id'));
      });
      this.set('nickname', app.getSettings('device-' + this.get('id')));
    },

    resetStyles: function() {
      app.comm.request('device:reset', { deviceId: this.get('id') });
    }
  });

  return Device;
});