define([
  'app',

  'routers/dialogs',
  'routers/devices',

  'collections/StyleNodes',
  'collections/devices',
  'collections/docs',

  'views/main',
  'views/session'
],

function(
    app,

    DialogsRouter,
    DevicesRouter,

    StyleNodesCollection,
    DevicesCollection,
    DocsCollection,

    MainView,
    SessionView
  ) {
  'use strict';
  var Router = Backbone.Router.extend({

    mainView: null,

    routes: {
      'session/:sessionId': 'managerSetup',
      '': 'getSession'
    },

    initialize: function() {
      // TODO: Debugging
      window.app = app;

      this.dialogs = new DialogsRouter();
      this.devices = new DevicesRouter();

      // Initialize stores
      app.collections.files = app.collections.files || new StyleNodesCollection();
      app.collections.devices = app.collections.devices || new DevicesCollection();
      app.collections.docs = app.collections.docs || new DocsCollection();
    },

    connect: function() {
      // Connection & listeners
      app.socket = window.io.connect(location.protocol + '//' + location.host);
      app.socket.on('manager:init', $.proxy(app.router.onInit, this));
      app.socket.on('device:add', $.proxy(app.router.devices.onAdd, app.router.devices));
      app.socket.on('device:remove', $.proxy(app.router.devices.onRemove, app.router.devices));
      app.socket.on('disconnect', $.proxy(app.router.onDisconnect, this));
      app.socket.on('change:response', app.comm.response);
      app.socket.on('property:check:response', app.comm.response);
    },

    // Main view setup
    managerSetup: function(sessionId) {
      app.data.session = sessionId;

      app.socket.emit('manager:init', {
        id: app.data.id,
        session: app.data.session
      });

      this.mainView = new MainView();
      this.mainView.on('device:edit', this.dialogs.editDevice, this);
      $('#main').html(this.mainView.render().$el);
      this.mainView.trigger('ready');
    },

    // Ask the user for the session name
    getSession: function() {
      var me = this;
      var view = new SessionView();
      view.on('session:set', function(session) {
        me.navigate('/session/' + session, true);
      });
      $('#main').html(view.render().$el);
      view.trigger('ready');
    },

    // Update all the properties when the server responds
    onInit: function(data) {
      app.data.app_name = data.name;
      app.data.version = data.version;
      app.data.modernizr = data.modernizr;

      // If there are no devices show the setup dialog
      this.mainView.$('.app-name').text(app.data.name);
      this.mainView.$('.version').text(app.data.version);
    },

    onDisconnect: function() {
      console.log('Disconnected');
      // TODO: Show a dialog, option to refresh the page (maybe even to reconnect)
      Backbone.trigger('disconnect');
    }

  });

  return Router;

});
