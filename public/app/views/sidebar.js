define([
  'app'
],

function(
    app
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
    },

    render: function() {
      this.$el.html(this.template(app.data));
      return this;
    },

    setNode: function(model) {
      this.$el.addClass('active');
      if (this.activeModel) {
        this.activeModel.off('change', this.onModelChange, this);
      }
      this.activeModel = model;
      this.activeModel.on('change', this.onModelChange, this);
      this.onModelChange();
    },

    onModelChange: function() {
      this.$('.sidebar-node-name').text(this.activeModel.get('name'));
      var deviceList = this.$('.sidebar-device-list').empty();
      _.each(this.activeModel.get('devices'), function(hash, deviceId) {
        var device = $('<li>')
          .text(app.collections.devices.get(deviceId).get('name'));
        deviceList.append(device);
      });
      // TODO: Colorpicker
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
      e.preventDefault();
      return false;
    },

    cleanup: function() {
      this.off();
    }
  });

  return Sidebar;
});