require([
  'app',

  'routers/main'
],

function(
    app,

    Router
  ) {
  'use strict';

  var getParameterByName = function(name) {
      name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
      var regexS = '[\\?&]' + name + '=([^&#]*)';
      var regex = new RegExp(regexS);
      var results = regex.exec(window.location.search);
      if (results === null) {
        return '';
      } else {
        return decodeURIComponent(results[1].replace(/\+/g, ' '));
      }
  };


  var currentLanguage = app.getSettings('language');
  localStorage.setItem('lang', currentLanguage);
  //basic application config
  app.helpers = {
    getParameterByName: getParameterByName
  };

  $(document).on('keyup', '.auto-size', app.autoSize);
  $(document).on('keydown', '.auto-size', app.autoSize);
  $(document).on('focus', '.auto-size', function(e) {
    var el = this;
    setTimeout(function() {
      el.select();
    }, 1);
  });

  I18n.init({
    locales: ['en', 'hr'],
    defaultLocale: 'en',
    warnForDefault: false
  });

  I18n.loadTranslation(currentLanguage, function() {
    app.router = new Router();
    app.router.connect();

    Backbone.history.start({
      pushState: false
    });
  }, this);
});