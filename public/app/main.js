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

    app.socket.on('init', app.router.onInit);
    app.socket.on('device-add', app.router.onDeviceAdd);
    app.socket.on('device-remove', app.router.onDeviceRemove);
    app.socket.on('disconnect', app.router.onDisconnect);

    app.socket.emit('manager-init', {
      id: app.data.id,
      session: app.data.session
    });

  }, this);
});