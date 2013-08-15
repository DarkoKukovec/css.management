define([
  'app'
],

function(app) {
  'use strict';
  var DeviceItem = Backbone.View.extend({
    tagName: 'li',
    className: 'device-item',
    template: app.fetchTemplate('device'),

    events: {
      // TODO: Tap on selection checkbox - change selected
      'change input[type=checkbox]': 'onCheckboxChange',
      'click .device-edit': 'onDeviceEditClick'
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
      var data = this.model.toJSON();
      data.selection = data.selected ? 'checked="checked"' : '';

      this.$el[data.connected ? 'show' : 'hide']();

      this.$el.html(this.template(data));

      return this;
    },

    onCheckboxChange: function() {
      var checked = this.$('input[type=checkbox]').prop('checked');
      this.$el[checked ? 'removeClass' : 'addClass']('disabled');
    },

    onDeviceEditClick: function() {
      this.trigger('device:edit', this.model);
    }

  });

  return DeviceItem;
});