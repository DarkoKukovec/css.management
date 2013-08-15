define([
  'app',

  'views/devices',
  // 'views/files',
  // 'views/sidebar',
  'views/footer'
],

function(
    app,

    DevicesView,
    // FilesView,
    // SidebarView,
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
      devices.on('device:edit:item', function(model) {
        this.trigger('device:edit', model);
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