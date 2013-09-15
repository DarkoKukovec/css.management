define([
  'app',

  'views/device',
  'views/files',
  // 'views/sidebar',
  'views/footer'
],

function(
    app,

    DeviceView,
    FileTabView,
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

      this.showDevices(ListView);
      this.showFileTabs(ListView);

      var footer = new FooterView();
      this.$('.footer').append(footer.render().$el);

      return this;
    },

    showDevices: function(ListView) {
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
    },

    showFileTabs: function(ListView) {
      var fileTabs = new ListView({
        tagName: 'ul',
        className: 'file-tabs',
        collection: app.collections.files,
        itemView: FileTabView
      });
      fileTabs.on('item:tab:click', this.showFileContent, this);
      this.$('.files').append(fileTabs.render().$el);
    },

    showFileContent: function(tabView, model) {

    },

    cleanup: function() {
      this.off();
    }
  });

  return Main;
});