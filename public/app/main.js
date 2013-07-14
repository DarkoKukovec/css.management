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


  var currentLanguage = getParameterByName('language') || 'en';
  localStorage.setItem('lang', currentLanguage);
  //basic application config
  app.helpers = {
    getParameterByName: getParameterByName
  };

  I18n.init({
    locales: ['en', 'hr'],
    defaultLocale: 'en',
    warnForDefault: false
  });

  I18n.loadTranslation(currentLanguage, function() {
    app.router = new Router();

    app.socket = io.connect(location.protocol + '//' + location.host);

  }, this);
});