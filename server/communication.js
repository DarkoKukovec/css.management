if (!socket) {
  console.log('Something went wrong!');
  return;
}

var managers = {};
var clients = {};

socket.on('connection', function(client) {

  /**
   * CLIENT
  **/
  client.on('client:init', function(data) {
    var id = data.id;
    client.clientID = id;
    var session = data.session;

    // Platform
    data.platform = getPlatformInfo(data.userAgent);

    // Cache params
    for (var i = 0; i < data.style.length; i++) {
      if (data.style[i].type === -2) {
        removeParams(data.style[i]);
      }
    }

    normalizeNodes(data.style);
    clients[session] = clients[session] || {};
    clients[session][id] = {
      id: id,
      comm: client,
      data: data
    };

    // Notify the manager
    if (managers[session]) {
      managers[session].comm.emit('device:add', data);
    }
  });

  // Change response from client to manager
  client.on('change:response', function(data) {
    if (managers[data.session]) {
      managers[data.session].comm.emmit('change:response', data);
    }
  });

  client.on('property:check', function(data) {
    clients[data.session][data.device].comm.emit('property:check', data);
  });

  client.on('property:check:response', function(data) {
    managers[data.session].comm.emit('property:check', data);
  });

  // client.on('modernizr:init', function(data) {
  //   clients[data.session][data.id].modernizr = data;
  //   // Notify the manager
  // });

  /**
   * MANAGER
   **/

  client.on('manager:init', function(data) {
    var id = data.id;
    client.managerID = id;
    var session = data.session;
    clients[session] = clients[session] || {};
    managers[session] = {
      id: id,
      comm: client,
      data: data
    };

    // Tell the manager about the active clients
    clients[session].each(function(cl) {
      client.emit('device:add', cl.data);
    });

    client.emit('manager:init', {
      name: appName,
      version: version,
      modernizr: modernizr,
      clients: clients[session].length
    });
  });

  // Change request from manager to client
  client.on('change:request', function(data) {
    data.payload.each(function(payload, deviceId) {
      if (clients[data.session] && clients[data.session][deviceId]) {
        clients[data.session][deviceId].comm.emit('change:request', payload);
      }
    });
  });

  client.on('disconnect', function(){
    var id;
    // Check clients and managers and clear the necesary data
    if (client.managerID) {
      id = client.managerID;
      managers.each(function(manager, session) {
        if (manager && manager.id == id) {
          managers[session] = null;
        }
      });
    }
    if (client.clientID) {
      id = client.clientID;
      clients.each(function(clientList, session) {
        if (clientList[id]) {
          delete clientList[id];
          if (managers[session]) {
            managers[session].comm.emit('device:remove', id);
          }
        }
      });
    }
  });
});