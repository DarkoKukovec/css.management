var Connection = {
  socket: null,
  init: function() {
    Connection.socket = io.connect('http://' + Utils.getHost());
  },

  on: function(tag, callback) {
    Connection.socket.on(tag, callback);
  },

  send: function(tag, message) {
    message.session = Utils.getSession();
    message.device = Utils.getID();
    Connection.socket.emit(tag, message);
  },

  disconnect: function() {
    Connection.socket.disconnect();
    Connection.socket = null;
  }
};