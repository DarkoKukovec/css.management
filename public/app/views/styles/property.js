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
      'change .node-property-name': 'onNameChange',
      'keyup .node-property-value': 'onValueChange',
      'click .important-toggle': 'onPriorityToggle'
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

    onPriorityToggle: function() {
      var important = !this.model.get('important');
      this.model.set('important', important);
      this.$('.important-toggle')[important ? 'addClass' : 'removeClass']('important-on');
    },

    cleanup: function() {
      this.off();
    }
  });

  return PropertyItem;
});