var Connection = {
  socket: null,
  init: function() {
    Connection.socket = io.connect(Utils.getURL());
  },

  on: function(tag, callback) {
    Connection.socket.on(tag, callback);
  },

  send: function(tag, message) {
    Connection.socket.emit(tag, message);
  },

  disconnect: function() {
    Connection.socket.disconnect();
    Connection.socket = null;
  }
};