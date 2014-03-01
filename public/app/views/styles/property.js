define([
  'app',
  'views/styles/property-group',
  'utils/numeric-fields'
],

function(
    app,
    PropertyGroupView,
    NumericFieldsUtils
  ) {
  'use strict';
  var PropertyItem = Backbone.View.extend({
    className: 'node node-property',
    template: app.fetchTemplate('styles/property'),

    events: {
      'change > span > .node-property-name': 'onNameChange',
      'keyup > span > .node-property-value': 'onValueChange',
      'keydown > span > .node-property-value': 'onValueKey',
      'keypress > span > .node-property-value': 'onValueKey',
      'blur > span > .node-property-value': 'onValueKey',
      'click > .important-toggle': 'onPriorityToggle',
      'change > .property-toggle': 'onToggle',
      'click > .reset-button': 'onReset',
      'click': 'setActive',
      'focus > span > input[type=text]': 'setActive',
      'focus > input[type=checkbox]': 'onCheckboxFocus'
    },

    initialize: function() {
      this.listenTo(this.model, 'change', this.updateData);
      this.listenTo(this.model, 'change:type', this.render);
      this.listenTo(this.model, 'property:value:change', this.updateValue);
    },

    render: function() {
      if (this.model.get('type') === -4) {
        var view = new PropertyGroupView({
          model: this.model
        });
        this.$el.html(view.render().$el);
      } else {
        var me = this;
        var data = this.model.toJSON();

        this.$el.html(this.template(data));

        this.$('.auto-size').each(function() {
          app.autoSize($(this));
        });
        this.updateData();
      }

      if (!this.model.get('enabled')) {
        this.$el.addClass('disabled-property');
        var checkbox = this.$('.property-toggle').get(0);
        if (checkbox) {
          checkbox.checked = false;
        }
      }

      return this;
    },

    cleanup: function() {
      this.off();
    },

    /***
     * UI event handlers
     ***/

    onToggle: function() {
      var enabled = this.$('.property-toggle').get(0).checked;
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

    onReset: function() {
      this.model.resetData();
      this.$('.node-property-name').val(this.model.get('name'));
      this.$('.important-toggle')[this.model.get('important') ? 'addClass' : 'removeClass']('important-on');
      if (!this.$('.property-toggle').get(0).checked) {
        this.$('.property-toggle').click();
      }
      this.updateValue();
    },

    onCheckboxFocus: function(e) {
      var chain = app.focusQueue.length && Math.abs(app.focusQueue[0].time.getTime() - (new Date()).getTime()) < 10;
      if (chain) {
        var last;
        for (var i = 0; i < app.focusQueue.length; i++) {
          if (app.focusQueue[i] && app.focusQueue[i].el &&  app.focusQueue[i].el !== e.target) {
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

    /***
     * Utils
     ***/

    updateValue: function() {
      this.$('.node-property-value').val(this.model.get('value'));
      app.autoSize(this.$('.node-property-value'));
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

    setActive: function(e) {
      Backbone.trigger('sidebar:node:set', this.model);
      if (e.target.select) {
        setTimeout(function() {
          e.target.select();
        }, 1);
      }
      // I put this here for a reason... I'm just not sure for which reason...
      // Reason: If the propagation is not stopped, the container (e.g. media) gets the active state in sidebar
      // Commented out because the toggle didn't work
      // return false;
    }
  });

  return PropertyItem;
});