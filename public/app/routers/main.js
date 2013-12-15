define([
  'app',

  'routers/dialogs',
  'routers/devices',

  'collections/StyleNodes',
  'collections/devices',

  'views/main',
  'views/session'
],

function(
    app,

    DialogsRouter,
    DevicesRouter,

    StyleNodesCollection,
    DevicesCollection,

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
    },

    connect: function() {
      // Connection & listeners
      app.socket = io.connect(location.protocol + '//' + location.host);
      app.socket.on('manager:init', $.proxy(app.router.onInit, this));
      app.socket.on('device:add', $.proxy(app.router.devices.onAdd, this));
      app.socket.on('device:remove', $.proxy(app.router.devices.onRemove, this));
      app.socket.on('disconnect', $.proxy(app.router.onDisconnect, this));
      app.socket.on('change:response', $.proxy(app.router.onChangeResponse, this));
      app.socket.on('property:check', $.proxy(app.router.onPropertyCheck, this));
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

    onChangeResponse: function(data) {
      console.log('Change response', data);
      // Can be ignorred, but if the response is not equal to the request,
      // it should add a new property before the current one
    },

    onPropertyCheck: function(data) {
      console.log('Property check', data);
      // TODO: When all clients respond, figure out the right property order
    },

    onDisconnect: function() {
      console.log('Disconnected');
      // TODO: Show a dialog, option to refresh the page (maybe even to reconnect)
    }

  });

  return Router;

});