define([
  'app'
],

function(
    app
  ) {
  'use strict';
  var StyleItem = Backbone.View.extend({
    tagName: 'li',

    initialize: function() {
      this.listenTo(this.model, 'change:devices', this.onDevicesChange, this);
    },

    render: function() {
      var type = app.types[this.model.get('type')];
      if (type === 'property-group') {
        type = 'property';
      }
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

    onDevicesChange: function() {
      var deviceCount = this.model.getDevices().length;
      this.$el[deviceCount ? 'show' : 'hide']();
    },

    cleanup: function() {
      this.off();
    }
  });

  return StyleItem;
});