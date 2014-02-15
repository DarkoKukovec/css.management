define([
  'app',

  'views/styles/main'
],

function(
    app,

    StyleView
  ) {
  'use strict';
  var StyleItem = Backbone.View.extend({
    className: 'node list-node node-style',
    template: app.fetchTemplate('styles/style'),

    events: {
      'click .new-property button': 'onNewClick'
    },

    render: function() {
      var me = this;
      var data = this.model.toJSON();
      data.name = data.name.replace(/"/g, '&#34;');

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

    onNewClick: function() {
      var me = this;
      var children = this.model.get('children');
      children.add({
        type: -1,
        parentDevices: this.model.get('devices'),
        enabled: true,
        hash: false,
        parentHash: this.model.get('hash'),
        name: ''
      });
      var node = children.last();
      node.listenerInit();
      node.parentNode = this.model;
      setTimeout(function() {
        me.$('.node-property-name').last().focus();
      }, 10);
    },

    cleanup: function() {
      this.off();
    }
  });

  return StyleItem;
});