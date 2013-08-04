
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
      app_name: 'styl.io',
      version: '',
      session: ''
    },
    settings: {
      defaults: {
        'language': 'en'
      }
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
    },
    getSettings: function(name) {
      app.settings[name] = app.settings[name] || localStorage[name];
      return app.settings[name] || app.settings.defaults[name] || null;
    },
    setSettings: function(name, value) {
      app.settings[name] = value;
      localStorage[name] = value;
    },
    getId: function() {
      if (!app.data.id) {
        var id = localStorage.id;
        if (id) {
          app.data.id = id;
        } else {
          app.data.id = Math.round(Math.random() * 1e12).toString(36);
          localStorage.id = app.data.id;
        }
      }
      return app.data.id;
    }
  });

  app.getId();

  // Localize or create a new JavaScript Template object.
  var JST = window.JST = window.JST || {};

  return app;

});