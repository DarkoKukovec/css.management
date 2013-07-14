define([
  'models/device'
],

function(
    DeviceModel
  ) {
  'use strict';
  var Devices = Backbone.Collection.extend({
    model: DeviceModel
  });

  return Devices;
});