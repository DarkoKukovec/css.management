var Startup = {
  init: function() {
    var start = (new Date()).getTime();
    Styles.all = Styles.getAll();
    var end = (new Date()).getTime();
    Utils.log('Style ' + (end - start));
    Connection.init();
    Startup.bindListeners();
    var id = Utils.getID();
    Connection.send('client:init', {
      id: id,
      session: Utils.getSession(),
      connectionId: id + '-' + (new Date()).getTime(),
      style: Utils.serialize(Styles.all),
      userAgent: window.navigator.userAgent
    });
  },
  bindListeners: function() {
    Connection.on('change:request', Change.exec);
    Connection.on('property:check', Probe.check);
    Connection.on('reset', function() {
      window.location.reload();
    });
  }
};