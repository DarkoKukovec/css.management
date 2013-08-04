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
      // TODO: Tap on the name - change the device name and save it to the localStorage
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
    }

  });

  return DeviceItem;
});