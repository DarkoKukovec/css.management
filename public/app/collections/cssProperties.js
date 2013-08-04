define([
  'models/cssProperty'
],

function(
    CssPropertyModel
  ) {
  'use strict';
  var CssProperties = Backbone.Collection.extend({
    model: CssPropertyModel
  });

  return CssProperties;
});