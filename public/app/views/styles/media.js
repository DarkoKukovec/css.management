define([
  'app',

  'views/styles/main',

  'utils/numeric-fields'
],

function(
    app,

    StyleView,

    NumericFieldsUtils
  ) {
  'use strict';
  var MediaItem = Backbone.View.extend({
    className: 'node list-node node-media',
    template: app.fetchTemplate('styles/media'),

    events: {
      'change > div > .node-media-name': 'onNameChange',
      'keyup > div > .node-media-name': 'onNameChange',
      'keydown > div > .node-media-name': 'onValueKey',
      'keypress > div > .node-media-name': 'onValueKey',
      'blur > div > .node-media-name': 'onValueKey',
      // 'change > .property-toggle': 'onToggle',
      'click > .reset-button': 'onReset',
      'click': 'setActive',
      'focus > div > input[type=text]': 'setActive',
      'focus > input[type=checkbox]': 'onCheckboxFocus'
    },

    initialize: function() {
      this.listenTo(this.model, 'change', this.updateData);
    },

    render: function() {
      var me = this;
      var data = this.model.toJSON();

      var ListView = Backbone.ListView.extend({});

      var styles = new ListView({
        tagName: 'ul',
        className: 'style-item',
        collection: this.model.get('children'),
        itemView: StyleView
      });

      this.$el.html(this.template(data));
      this.$('.children-list').html(styles.render().$el);

      app.autoSize(this.$('> .node-name .auto-size'));

      return this;
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
      this.model.set('name', this.$('.node-media-name').val());
    },

    onValueKey: function(e) {
      var value = NumericFieldsUtils.update(e, this.$('.node-media-name').get(0));
    },

    onReset: function() {
      this.model.resetData();
      this.$('.node-media-name').val(this.model.get('name'));
      this.$('.important-toggle')[this.model.get('important') ? 'addClass' : 'removeClass']('important-on');
      if (!this.$('.property-toggle').get(0).checked) {
        this.$('.property-toggle').click();
      }
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
        if (last === this.$('.node-media-name').get(0)) {
          app.focusBack(e.target);
        } else {
          this.$('.node-media-name').focus();
        }
      }
    },

    /***
     * Utils
     ***/

    updateData: function() {
      this.$el[this.model.isOriginal() ? 'removeClass' : 'addClass']('changed-node');
    },

    setActive: function(e) {
      if (this.focused) {
        return;
      }
      Backbone.trigger('sidebar:node:set', this.model);
      if (e.target.select) {
        var me = this;
        this.focused = true;
        $(e.target).one('blur', function() {
          me.focused = false;
        });
        setTimeout(function() {
          e.target.select();
        }, 1);
      }
      return false;
    }
  });

  return MediaItem;
});
