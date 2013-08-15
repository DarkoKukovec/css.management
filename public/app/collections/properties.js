define([
  'models/property'
],

function(
    PropertyModel
  ) {
  'use strict';
  var Properties = Backbone.Collection.extend({
    model: PropertyModel
  });

  // On change - send to devices

  return Properties;
});