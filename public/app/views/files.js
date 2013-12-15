define([
  'app'
],

function(app) {
  'use strict';
  var FileTabItem = Backbone.View.extend({
    tagName: 'li',
    className: 'file-tab',
    template: app.fetchTemplate('filetab'),

    events: {
      'click': 'onTabClick'
    },

    initialize: function() {
      this.listenTo(this.model, 'change:devices', this.onDeviceChange, this);
      this.listenTo(this.model, 'change:name', this.onNameChange, this);
    },

    render: function() {
      var data = this.model.toJSON();
      this.$el.html(this.template(data));
      this.$el.attr('data-file-hash', this.model.get('hash'));

      this.onDeviceChange();

      return this;
    },

    onDeviceChange: function() {
      var visible = !!_.keys(this.model.get('devices')).length;
      this.$el[visible ? 'show' : 'hide']();
    },

    onNameChange: function() {
      this.$('.file-name').text(this.model.get('name'));
    },

    onTabClick: function() {
      this.trigger('tab:click', this.model);
    }

  });

  return FileTabItem;
});