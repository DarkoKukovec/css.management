define([
  'app'
],

function(
    app
  ) {
  'use strict';
  var Footer = Backbone.View.extend({
    className: 'footer-container',
    template: app.fetchTemplate('footer'),

    events: {
      'click .settings': 'onSettingsClick',
      'click .export': 'onExportClick',
      'click .info': 'onInfoClick'
    },

    render: function() {
      var me = this;

      this.$el.html(this.template(app.data));
      return this;
    },

    cleanup: function() {
      this.off();
    },

    onSettingsClick: function() {
      // TODO: Show settings dialog
    },

    onExportClick: function() {
      // TODO: Show export dialog
    },

    onInfoClick: function() {
      // TODO: Show info dialog
    }
  });

  return Footer;
});