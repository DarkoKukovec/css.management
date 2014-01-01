define([
  'app'
],

function(app) {
  'use strict';
  var DeviceItem = Backbone.View.extend({
    tagName: 'li',
    className: 'device-item card',
    template: app.fetchTemplate('device'),

    events: {
      'change input[type=checkbox]': 'onCheckboxChange',
      'click .device-edit': 'onDeviceEditClick',
      'click .device-reset': 'onDeviceResetClick'
    },

    initialize: function() {
      if (this.model.get('selected') === undefined) {
        this.model.set('selected', true);
      }
      this.model.on('change', this.render, this);
    },

    cleanup: function() {
      this.model.off(null, null, this);
    },

    render: function() {
      var me = this;
      var data = this.model.toJSON();
      data.selection = data.selected ? 'checked="checked"' : '';

      this.$el[data.connected ? 'show' : 'hide']();

      this.$el.html(this.template(data));

      setTimeout(function() {
        me.$el.addClass('display');
      }, 200);

      return this;
    },

    onCheckboxChange: function() {
      var checked = this.$('input[type=checkbox]').prop('checked');
      this.$el[checked ? 'removeClass' : 'addClass']('disabled');
    },

    onDeviceEditClick: function() {
      this.trigger('device:edit', this.model);
      // TODO: Do this with a custom dialog?
      var name = prompt('Device name:', this.model.get('nickname'));
      this.model.set('nickname', name);
    },

    onDeviceResetClick: function() {
      this.model.resetStyles();
    }

  });

  return DeviceItem;
});