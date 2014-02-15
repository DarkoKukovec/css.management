define([
  'app'
],

function(
    app
  ) {
  'use strict';
  var Session = Backbone.View.extend({
    className: 'session-container',
    template: app.fetchTemplate('session'),

    events: {
      'click .set': 'onSetClick'
    },

    render: function() {
      var me = this;

      this.$el.html(this.template(app.data));

      this.once('ready', function() {
        setTimeout(function() {
          me.$('.dialog').parent().addClass('display');
        }, 500);
      });

      return this;
    },

    onSetClick: function() {
      var name = this.$('#session-name').val();
      if (name) {
        this.trigger('session:set', name);
      } else {
        alert(I18n.t('session_name_required'));
      }
    },

    cleanup: function() {
      this.off();
    }
  });

  return Session;
});