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

  return Properties;
});