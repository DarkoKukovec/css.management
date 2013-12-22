define([
  'app'
],

function(
    app
  ) {
  'use strict';
  var Footer = Backbone.View.extend({
    className: 'docs',
    template: app.fetchTemplate('docs'),

    render: function() {
      var data = this.model.toJSON();

      if (data.loaded) {
        var url = 'https://developer.mozilla.org';
        data.summary = data.summary.replace(/href=\"/g, 'target="_blank" href="' + url);
        data.url = url + data.url;
        this.$el.html(this.template(data));
      } else {
        this.$el.text(I18n.t('loading'));
      }

      return this;
    },

    cleanup: function() {
      this.off();
    }
  });

  return Footer;
});