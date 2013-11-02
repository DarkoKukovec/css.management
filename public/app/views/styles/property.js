define([
  'app'
],

function(
    app
  ) {
  'use strict';
  var PropertyItem = Backbone.View.extend({
    className: 'node node-property',
    template: app.fetchTemplate('styles/property'),

    events: {
      'keyup .node-property-name': 'onNameChange',
      'keyup .node-property-value': 'onValueChange'
    },

    render: function() {
      var me = this;
      var data = this.model.toJSON();

      this.$el.html(this.template(data));

      this.$('.auto-size').each(function() {
        app.autoSize($(this));
      });

      return this;
    },

    onNameChange: function() {
      this.model.set('name', this.$('.node-property-name').val());
    },

    onValueChange: function() {
      this.model.set('value', this.$('.node-property-value').val());
    },

    cleanup: function() {
      this.off();
    }
  });

  return PropertyItem;
});