define([
  'app'
],

function(
    app
  ) {
  'use strict';
  var StyleItem = Backbone.View.extend({
    tagName: 'li',

    render: function() {
      var type = app.types[this.model.get('type')];
      var me = this;
      require([
        'views/styles/' + type
      ], function(StyleView) {
        var styleView = new StyleView({
          model: me.model
        });

        me.$el.html(styleView.render().$el);
      });

      return this;
    },

    cleanup: function() {
      this.off();
    }
  });

  return StyleItem;
});