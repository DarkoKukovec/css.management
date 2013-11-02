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

    render: function() {
      var me = this;
      var data = this.model.toJSON();
      data.name = data.name.replace(/"/g, '\\"');

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

    cleanup: function() {
      this.off();
    }
  });

  return StyleItem;
});