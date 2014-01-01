
define([
  // Libraries.
  'jquery',
  'underscore',
  'backbone',
  'I18n',
  'io',
  'spectrum',
  //plugins
  'listview'
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
        language: 'en',
        colorFormat: 'hex'
      }
    },
    types: {
      '-4': 'property-group',
      '-3': 'inline-style',
      '-2': 'file-style',
      '-1': 'property',
      1: 'style',
      4: 'media'
    },
    focusQueue: []
  };

  var sizer = $('.sizer');

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
    removeSettings: function(name) {
      delete app.settings[name];
      localStorage.removeItem(name);
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
    },
    autoSize: function($el) {
      if ($el.target) {
        $el = $(this);
      }
      if (!$el.length) {
        return;
      }
      $el.width($el.val().length * 7);
    },
    focusBack: function(el) {
      var index = $('input, textarea').index(el) - 1;
      $('input, textarea').eq(index).focus();
    }
  });

  app.getId();

  app.comm = (function() {
    var callbacks = {};

    function request(tag, data, callback, scope) {
      var id = tag + '-' + (new Date()).getTime() + '-' + Math.random();
      if (typeof callback === 'function') {
        callbacks[id] = {
          id: id,
          tag: tag,
          callback: callback,
          scope: scope,
          counter: tag === 'change:request' ? _.keys(data.payload.devices).length : 1
        };
      }
      data.requestId = id;
      data.session = app.data.session;
      app.socket.emit(tag, data);
    }

    function response(data) {
      var c = callbacks[data.requestId];
      if (c) {
        c.callback.call(c.scope, data);
        c.counter--;
        if (c.counter === 0) {
          delete callbacks[data.requestId];
        }
      }
    }

    return {
      request: request,
      response: response
    };
  })();

  // Localize or create a new JavaScript Template object.
  var JST = window.JST = window.JST || {};

  return app;

});