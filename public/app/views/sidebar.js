define([
  'app',

  'views/docs'
],

function(
    app,

    DocsView
  ) {
  'use strict';
  var Sidebar = Backbone.View.extend({
    className: 'sidebar',
    template: app.fetchTemplate('sidebar'),

    events: {
      'click .settings': 'onSettingsClick',
      'click .export': 'onExportClick',
      'click .info': 'onInfoClick',
      'click': 'onClick'
    },

    activeModel: null,

    initialize: function() {
      this.listenTo(Backbone, 'sidebar:node:set', this.setNode, this);
      this.listenTo(Backbone, 'sidebar:clear', this.clearData, this);
      this.listenTo(Backbone, 'sidebar:docs:loaded', this.showDocs, this);
    },

    render: function() {
      var me = this;
      this.$el.html(this.template(app.data));

      this.$('.sidebar-colorpicker').spectrum({
        flat: true,
        showInput: true,
        showAlpha: true,
        showButtons: false,
        preferredFormat: app.getSettings('colorFormat'),
        move: function(color) {
          if (color.alpha < 1) {
            color = color.toRgbString();
          } else {
            var format = app.getSettings('colorFormat');
            if (format === 'rgb') {
              color = color.toRgbString();
            } else if (format === 'hsl') {
              color = color.toHslString();
            } else {
              color = color.toHexString();
            }
          }
          me.activeModel.set('value', color);
          me.activeModel.trigger('property:value:change');
        }
      });

      return this;
    },

    setNode: function(model) {
      this.$el.addClass('active');
      if (this.activeModel) {
        this.activeModel.off('change:name', this.onModelChange, this);
        this.activeModel.off('change:value', this.onValueChange, this);
      }
      this.activeModel = model;
      this.activeModel.on('change:name', this.onModelChange, this);
      this.activeModel.on('change:value', this.onValueChange, this);
      this.onModelChange();
      this.onValueChange();
    },

    onValueChange: function() {
      if (this.activeModel && this.activeModel.isColor()) {
        this.$('.sidebar-colorpicker').spectrum('reflow');
        this.$('.sidebar-colorpicker').spectrum('set', this.activeModel.get('value'));
      }
    },

    onModelChange: function() {
      if (!this.activeModel) {
        this.clearData();
        return;
      }
      var name = this.activeModel.get('name');
      this.showDocs();
      this.$('.sidebar-node-name').text(name);
      var deviceList = this.$('.sidebar-device-list').empty();
      _.each(this.activeModel.get('devices'), function(hash, deviceId) {
        var device = $('<li>')
          .text(app.collections.devices.get(deviceId).get('name'));
        deviceList.append(device);
      });

      if (this.activeModel && this.activeModel.isColor()) {
        this.$('.sp-container').show();
      } else {
        this.$('.sp-container').hide();
      }
    },

    showDocs: function(docModel) {
      if (!this.activeModel) {
        return;
      }
      var name = this.activeModel.get('name');
      if (this.activeModel.get('type') === 4) {
        name = '@media';
      }
      if (docModel) {
        if (docModel.get('name') !== name) {
          return;
        }
        var docsView = new DocsView({
          model: docModel
        });
        this.$('.docs-container').html(docsView.render().$el);
        return;
      }
      var doc = app.collections.docs.get(name);
      if (!doc) {
        app.collections.docs.add({ name: name });
        this.showDocs();
      } else if (!doc.get('loaded')) {
        doc.fetch({
          success: $.proxy(this.showDocs, this)
        });
      } else {
        this.showDocs(doc);
      }
    },

    clearData: function() {
      this.$el.removeClass('active');
      if (this.activeModel) {
        this.activeModel.off('change', this.onModelChange, this);
        this.activeModel = null;
      }
      this.$('.sidebar-node-name').text('');
      var deviceList = this.$('.sidebar-device-list').empty();
      // TODO: Colorpicker
    },

    onClick: function(e) {
      // return false;
    },

    cleanup: function() {
      this.off();
    }
  });

  return Sidebar;
});