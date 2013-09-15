define([
  'models/styleNode'
],

function(
    StyleNode
  ) {
  'use strict';
  var StyleNodes = Backbone.Collection.extend({
    model: StyleNode,

    updateStyles: function(device, styles) {},
    removeStyles: function(device, styles) {},

    addBefore: function(target, destination) {},
    addAfter: function(target, destination) {},

    moveBefore: function(target, destination) {},
    moveAfter: function(target, destination) {}
  });

  return StyleNodes;
});