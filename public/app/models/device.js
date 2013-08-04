define([
  'app'
],

function(
    app
  ) {
  'use strict';
  var Device = Backbone.Model.extend({
    initialize: function() {
      this.on('change:id, change:nickname, reset', function() {
        this.set('name', this.get('nickname') || this.get('id'));
      });
      this.set('name', this.get('nickname') || this.get('id'));
    }
  });

  return Device;
});