define([
  'app'
],

function(
    app
  ) {
  'use strict';
  var Style = Backbone.Model.extend({
    compare: function(newStyle) {}
  });

  return Style;
});