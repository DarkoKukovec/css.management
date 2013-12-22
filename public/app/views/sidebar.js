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
      this.$el.html(this.template(app.data));
      return this;
    },

    setNode: function(model) {
      this.$el.addClass('active');
      if (this.activeModel) {
        this.activeModel.off('change:name', this.onModelChange, this);
      }
      this.activeModel = model;
      this.activeModel.on('change:name', this.onModelChange, this);
      this.onModelChange();
    },

    onModelChange: function() {
      var name = this.activeModel.get('name');
      this.showDocs();
      this.$('.sidebar-node-name').text(name);
      var deviceList = this.$('.sidebar-device-list').empty();
      _.each(this.activeModel.get('devices'), function(hash, deviceId) {
        var device = $('<li>')
          .text(app.collections.devices.get(deviceId).get('name'));
        deviceList.append(device);
      });
      // TODO: Colorpicker
    },

    showDocs: function(docModel) {
      var name = this.activeModel.get('name');
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