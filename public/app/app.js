
define([
  // Libraries.
  'jquery',
  'underscore',
  'backbone',
  'I18n',
  'io'
  //plugins
],

function(
    $,
    _,
    Backbone
  ) {
  'use strict';
  var app = {
    collections: {},
    root: '',
    data: {
      app_name: 'styl.io'
    }
  };

  _.extend(app, {
    fetchTemplate: function(path) {
      var fullPath = 'app/templates/' + path + '.html';
      if (!JST[fullPath]) {
        $.ajax({
          url: app.root + fullPath,
          dataType: 'text',
          async: false,
          success: function(contents) {
            JST[fullPath] = _.template(contents);
          }
        });
      }

      return JST[fullPath];
    }
  });
  // Localize or create a new JavaScript Template object.
  var JST = window.JST = window.JST || {};

  return app;

});