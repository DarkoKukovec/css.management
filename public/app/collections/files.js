define([
  'models/file'
],

function(
    FileModel
  ) {
  'use strict';
  var Files = Backbone.Collection.extend({
    model: FileModel
  });

  return Files;
});