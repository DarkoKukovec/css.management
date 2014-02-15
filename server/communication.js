if (!socket) {
  console.log('Something went wrong!');
  return;
}

var managers = {};
var clients = {};
var map = {};

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

    map[session] = map[session] || {};
    map[session][id] = map[session][id] || {};
    normalizeNodes(data.style, map[session][id], function(style) {
            // hash: hash,
            // parentHash: parent.get('devices')[device],
            // type: model.get('type'),
            // oldName: model.previous('name'),
            // name: model.get('name'),
            // value: model.get('value'),
            // important: model.get('important'),
            // action: action
      client.emit('change:request', {
        session: session,
        requestId: false,
        hash: style.hash,
        parentHash: style.parentHash,
        type: style.type,
        oldName: style.originalName,
        name: style.name,
        value: style.value,
        important: style.originalImportant,
        action: 'rename'
      });
    });
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
    if (data.change) {
      var c = clients[data.session][data.device];
      if (!map[data.session][data.device][data.hash]) {
        // New node
        map[data.session][data.device][data.hash] = {};
      }
      map[data.session][data.device][data.hash].name = data.data.name;
      map[data.session][data.device][data.hash].value = data.newValue;
      updateNode(c.data.style, data.hash, data.data.name, data.newValue);
    }
    if (managers[data.session]) {
      managers[data.session].comm.emit('change:response', data);
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

  client.on('device:reset', function(data) {
    map[data.session][data.deviceId] = {};
    clients[data.session][data.deviceId].comm.emit('device:reset', null);
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
          var connectionId = clientList[id].data.connectionId;
          delete clientList[id];
          if (managers[session]) {
            managers[session].comm.emit('device:remove', {id: id, connectionId: connectionId });
          }
        }
      });
    }
  });
});