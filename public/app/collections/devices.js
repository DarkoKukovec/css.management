define([
  'models/device'
],

function(
    DeviceModel
  ) {
  'use strict';
  var Devices = Backbone.Collection.extend({
    model: DeviceModel,

    available: function() {
      return !!this.findWhere({connected: true});
    }
  });

  return Devices;
});