define([
  'models/style'
],

function(
    StyleModel
  ) {
  'use strict';
  var Styles = Backbone.Collection.extend({
    model: StyleModel,
    merge: function(newStyles) {

    }
  });

  return Styles;
});