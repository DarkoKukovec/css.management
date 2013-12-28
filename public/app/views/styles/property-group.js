define([
  'app',

  'views/styles/main'
],

function(
    app,

    StyleView
  ) {
  'use strict';
  var PropertyGroup = Backbone.View.extend({
    className: 'node group-node node-property-group',

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

      this.$el.html(styles.render().$el);

      app.autoSize(this.$('> .node-name .auto-size'));

      return this;
    },

    cleanup: function() {
      this.off();
    }
  });

  return PropertyGroup;
});