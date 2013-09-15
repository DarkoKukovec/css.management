define([
  'app',

  'views/device',
  // 'views/files',
  // 'views/sidebar',
  'views/footer'
],

function(
    app,

    DeviceView,
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

      var ListView = Backbone.ListView.extend({});

      var devices = new ListView({
        tagName: 'ul',
        className: 'devices-list',
        collection: app.collections.devices,
        itemView: DeviceView
      });
      devices.on('item:device:edit', function(view, model) {
        this.trigger('device:edit', model);
      }, this);
      this.$('.devices-container').append(devices.render().$el);

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