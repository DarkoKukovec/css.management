define([
  'app'
],

function(
    app
  ) {
  'use strict';
  var Main = Backbone.View.extend({
    className: 'main-container',
    template: app.fetchTemplate('main'),

    render: function() {
      var me = this;

      this.$el.html(this.template(app.data));
      return this;
    },

    cleanup: function() {
      this.off();
    }
  });

  return Main;
});