define([
  'app',
  'utils/numeric-fields'
],

function(
    app,

    NumericFieldsUtils
  ) {
  'use strict';
  var PropertyItem = Backbone.View.extend({
    className: 'node node-property',
    template: app.fetchTemplate('styles/property'),

    events: {
      'change .node-property-name': 'onNameChange',
      'keyup .node-property-value': 'onValueChange',
      'keydown .node-property-value': 'onValueKey',
      'keypress .node-property-value': 'onValueKey',
      'blur .node-property-value': 'onValueKey',
      'click .important-toggle': 'onPriorityToggle',
      'change .property-toggle': 'onToggle',
      'click .reset-button': 'onReset',
      'click': 'setActive',
      'focus input[type=text]': 'setActive',
      'focus input[type=checkbox]': 'onCheckboxFocus'
    },

    initialize: function() {
      this.listenTo(this.model, 'change', this.updateData);
      this.listenTo(this.model, 'property:value:change', this.updateValue);
    },

    render: function() {
      var me = this;
      var data = this.model.toJSON();

      this.$el.html(this.template(data));

      this.$('.auto-size').each(function() {
        app.autoSize($(this));
      });

      this.updateData();

      return this;
    },

    updateValue: function() {
      this.$('.node-property-value').val(this.model.get('value'));
      app.autoSize(this.$('.node-property-value'));
    },

    onToggle: function() {
      var enabled = this.$('.property-toggle').prop('checked');
      this.model.set('enabled', enabled);
      this.$el[enabled ? 'removeClass' : 'addClass']('disabled-property');
    },

    onNameChange: function() {
      this.model.set('name', this.$('.node-property-name').val());
    },

    onValueChange: function(e) {
      this.onValueKey(e);
      this.model.set('value', this.$('.node-property-value').val());
    },

    onPriorityToggle: function() {
      var important = !this.model.get('important');
      this.model.set('important', important);
      this.$('.important-toggle')[important ? 'addClass' : 'removeClass']('important-on');
    },

    onValueKey: function(e) {
      var value = NumericFieldsUtils.update(e, this.$('.node-property-value'));
    },

    updateData: function() {
      if (!this.model.isColor()) {
        this.$el.removeClass('color-node');
      } else {
        this.$el.addClass('color-node');
        this.$('.node-color-indicator').css('background-color', this.model.get('value'));
      }
      this.$el[this.model.isOriginal() ? 'removeClass' : 'addClass']('changed-node');
    },

    onReset: function() {
      this.model.resetData();
      this.$('.node-property-name').val(this.model.get('name'));
      this.$('.node-property-value').val(this.model.get('value'));
      this.$('.important-toggle')[this.model.get('important') ? 'addClass' : 'removeClass']('important-on');
      if (!this.$('.property-toggle').prop('checked')) {
        this.$('.property-toggle').click();
      }
    },

    setActive: function(e) {
      Backbone.trigger('sidebar:node:set', this.model);
    },

    onCheckboxFocus: function(e) {
      var chain = app.focusQueue.length && Math.abs(app.focusQueue[0].time.getTime() - (new Date()).getTime()) < 10;
      if (chain) {
        var last;
        for (var i = 0; i < app.focusQueue.length; i++) {
          if (app.focusQueue[i] && app.focusQueue[i].el &&  app.focusQueue[i].el != e.target) {
            last = app.focusQueue[i].el;
            break;
          }
        }
        if (last === this.$('.node-property-name').get(0)) {
          app.focusBack(e.target);
        } else {
          this.$('.node-property-name').focus();
        }
      }
    },

    cleanup: function() {
      this.off();
    }
  });

  return PropertyItem;
});