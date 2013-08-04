define([
  'app',

  'views/devices',
  // 'views/files',
  'views/footer'
],

function(
    app,

    DevicesView,
    // FilesView,
    FooterView
  ) {
  'use strict';
  var Main = Backbone.View.extend({
    className: 'main-container',
    template: app.fetchTemplate('main'),

    render: function() {
      var me = this;

      this.$el.html(this.template(app.data));

      var devices = new DevicesView({
        collection: app.collections.devices
      });
      this.$('.devices-container').append(devices.render().$el);
      app.collections.devices.trigger('reset');

      var footer = new FooterView();
      this.$('.footer').append(footer.render().$el);

      return this;
    },

    cleanup: function() {
      this.off();
    }
  });

  return Main;
});