define([
  'models/style'
],

function(
    StyleModel
  ) {
  'use strict';
  var Styles = Backbone.Collection.extend({
    model: StyleModel
  });

  return Styles;
});