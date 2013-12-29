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
      app.socket = io.connect(location.protocol + '//' + location.host);
      app.socket.on('manager:init', $.proxy(app.router.onInit, this));
      app.socket.on('device:add', $.proxy(app.router.devices.onAdd, this));
      app.socket.on('device:remove', $.proxy(app.router.devices.onRemove, this));
      app.socket.on('disconnect', $.proxy(app.router.onDisconnect, this));
      app.socket.on('change:response', app.comm.response);
      app.socket.on('property:check', app.comm.response);
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

    // TODO: Needs refactoring
    checks: {},
    propertyCheck: function(device, property, values, callback, scope) {
      var id = device.get('id') + '-' + property.hash + '-' + (new Date()).getTime();
      this.checks[id] = {
        id: id,
        callback: callback,
        scope: scope
      };
      app.socket.emit('property:check', {
        device: device.get('id'),
        session: app.data.session,
        property: property.hash,
        parent: property.parentHash,
        values: values,
        checkId: id
      });
    },
    onPropertyCheck: function(data) {
      console.log('Property check', data);
      if (this.checks[data.checkId]) {
        var check = this.checks[data.checkId];
        check.callback.call(check.scope, data.results);
      }
    },

    // TODO: Needs refactoring
    changes: {},
    changeRequest: function(payload, callback, scope) {
      this.changes[payload.changeId] = {
        id: payload.changeId,
        callback: callback,
        scope: scope
      };
      app.socket.emit('change:request', payload);
    },
    onChangeResponse: function(data) {
      console.log('Change response', data);
      if (this.changes[data.changeId]) {
        var change = this.changes[data.changeId];
        change.callback.call(change.scope, data);
      }
    },

    onDisconnect: function() {
      console.log('Disconnected');
      // TODO: Show a dialog, option to refresh the page (maybe even to reconnect)
    }

  });

  return Router;

});