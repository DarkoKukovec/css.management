requirejs.config({
  deps: ['main'],

  paths: {
    // JavaScript folders.
    libs: '../assets/javascript/libs',
    plugins: '../assets/javascript/plugins',

    // Libraries.
    jquery: '../assets/javascript/libs/jquery-2.0.3',

    //underscore replacment
    underscore: '../assets/javascript/libs/lodash-1.3.1',
    //backbone
    backbone: '../assets/javascript/libs/backbone-1.0.0',

    // Internationalization
    I18n: '../assets/javascript/libs/I18n',

    io: '../socket.io/socket.io.js'
  },

  shim: {
    backbone: {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },

    jquery: {
      exports: '$'
    }
  }

});