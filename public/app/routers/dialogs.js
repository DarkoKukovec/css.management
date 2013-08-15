define([
  'app'
],

function(
    app
  ) {
  'use strict';
  var Router = Backbone.Router.extend({

    editDevice: function(model) {
      console.log('edit', model.toJSON());
    }

  });

  return Router;

});