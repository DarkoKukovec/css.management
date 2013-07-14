define([
  'models/propertyValue'
],

function(
    PropertyValueModel
  ) {
  'use strict';
  var PropertyValues = Backbone.Collection.extend({
    model: PropertyValueModel
  });

  return PropertyValues;
});