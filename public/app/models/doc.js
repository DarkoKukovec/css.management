define([
  'app'
],

function(
    app
  ) {
  'use strict';
  var Doc = Backbone.Model.extend({
    defaults: {
      loaded: false
    },

    idAttribute: 'name',

    initialize: function() {
      this.on('change', function() {
        this.set('loaded', true);
      });
    },

    url: function() {
      return 'https://developer.mozilla.org/en-US/docs/Web/CSS/' + this.get('name') + '$json';
    }
  });

  return Doc;
});