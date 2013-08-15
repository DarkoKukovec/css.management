define([
  'app',

  'routers/dialogs',

  'collections/files',
  'collections/styles',
  'collections/devices',

  'views/main',
  'views/session'
],

function(
    app,

    DialogsRouter,

    FilesCollection,
    StylesCollection,
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

      // Initialize stores
      app.collections.files = app.collections.files || new FilesCollection();
      app.collections.devices = app.collections.devices || new DevicesCollection();
    },

    connect: function() {
      // Connection & listeners
      app.socket = io.connect(location.protocol + '//' + location.host);
      app.socket.on('manager:init', $.proxy(app.router.onInit, this));
      app.socket.on('device:add', $.proxy(app.router.onDeviceAdd, this));
      app.socket.on('device:remove', $.proxy(app.router.onDeviceRemove, this));
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
    },

    // Ask the user for the session name
    getSession: function() {
      var me = this;
      var view = new SessionView();
      view.on('session:set', function(session) {
        me.navigate('/session/' + session, true);
      });
      $('#main').html(view.render().$el);
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

    onDeviceAdd: function(data) {
      console.log('New device', data);
      var device = app.collections.devices.get(data.id);
      if (device) {
        device.set('connected', true);
      } else {
        app.collections.devices.add({
          id: data.id,
          platform: data.platform,
          connected: true
        });
      }

      // Should this be neccessary?
      app.collections.devices.trigger('reset');

      // TODO: Add the device styles to the current styles.
      // When going trough the styles, references to the device have to be removed
      // for every style that this device doesn't contain anymore
    },

    onDeviceRemove: function(deviceId) {
      console.log('Device gone', deviceId);
      app.collections.devices.get(deviceId).set('connected', false);

      // Should this be neccessary?
      app.collections.devices.trigger('reset');

      // TODO: Go trough all the styles and lower the reference counter
      // for every item that references the disconnected device
      // The reference has to stay in order to be able to reapply the styles on refresh
    },

    onDisconnect: function() {
      console.log('Disconnected');
      // TODO: Show a dialog, option to refresh the page (maybe even to reconnect)
    }

  });

  return Router;

});