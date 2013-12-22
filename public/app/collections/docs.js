define([
  'models/doc'
],

function(
    DocModel
  ) {
  'use strict';
  var Docs = Backbone.Collection.extend({
    model: DocModel
  });

  return Docs;
});