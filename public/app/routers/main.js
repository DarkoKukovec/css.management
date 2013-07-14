define([
  'app',

  'collections/files',
  'collections/styles',
  'collections/devices',

  'views/main'
],

function(
    app,

    FilesCollection,
    StylesCollection,
    DevicesCollection,

    MainView
  ) {
  'use strict';
  var Router = Backbone.Router.extend({

    initialize: function() {
      // TODO: Debugging
      window.app = app;

      // Initialize stores
      app.collections.files = app.collections.files || new FilesCollection();
      app.collections.styles = app.collections.styles || new StylesCollection();
      app.collections.devices = app.collections.devices || new DevicesCollection();

      var view = new MainView();
      $('#main').html(view.render().$el);
    }

  });

  return Router;

});