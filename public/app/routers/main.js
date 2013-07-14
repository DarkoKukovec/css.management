define([
  'app'
],

function(
    app
  ) {
  'use strict';
  var Router = Backbone.Router.extend({
    routes: {
      '': 'index'
    },

    initialize: function() {
      // TODO: Debugging
      window.app = app;
    },

    index: function() {

    }
  });

  return Router;

});