define([
  'app',

  'views/device',
  'views/files',
  'views/sidebar',
  'views/footer',
  'views/styles/main'
],

function(
    app,

    DeviceView,
    FileTabView,
    SidebarView,
    FooterView,
    StyleView
  ) {
  'use strict';
  var Main = Backbone.View.extend({
    className: 'main-container',
    template: app.fetchTemplate('main'),

    activeFile: null,
    styles: {},

    events: {
      'click': 'clearSidebar'
    },

    render: function() {
      var me = this;

      this.$el.html(this.template(app.data));

      var ListView = Backbone.ListView.extend({});

      this.showDevices(ListView);
      this.showFileTabs(ListView);

      this.once('ready', function() {
        me.showFileContent();
      });

      var sidebar = new SidebarView();
      this.$('.sidebar-container').append(sidebar.render().$el);

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
      fileTabs.on('item:add', this.setActiveFile, this);
      fileTabs.on('item:tab:click', this.showFileContent, this);
      this.$('.files').append(fileTabs.render().$el);
    },

    setActiveFile: function(model) {
      if (!this.activeFile) {
        this.showFileContent(model);
      }
    },

    showFileContent: function(model) {
      if (!model) {
        // Set first as active
        model = app.collections.files.first();
      } else if (model && model.model) {
        model = model.model;
      }
      if (model) {
        if (!this.styles[model.get('hash')]) {
          var ListView = Backbone.ListView.extend({});
          this.styles[model.get('hash')] = new ListView({
            tagName: 'ul',
            className: 'style-item',
            collection: model.get('children'),
            itemView: StyleView
          });
          this.$('.styles-container').append(this.styles[model.get('hash')].render().$el);
        }
        this.$('.styles-container > .style-item').hide();
        this.styles[model.get('hash')].$el.show();
        this.$('.file-tab').removeClass('active');
        this.$('.file-tab[data-file-hash=' + model.get('hash') + ']').addClass('active');
        this.activeFile = model;
      }
    },

    clearSidebar: function(e) {
      if (this.$('.sidebar').find(e.target).length === 0) {
        Backbone.trigger('sidebar:clear');
      }
    },

    cleanup: function() {
      this.off();
    }
  });

  return Main;
});