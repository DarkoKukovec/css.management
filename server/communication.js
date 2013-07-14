var platform = require('platform');
var crypto = require('crypto');

if (!socket) {
  return;
}

var managers = {};
var clients = {};

socket.on('connection', function(client) {
  client.on('ping', function() {
    client.emit('pong');
  });

  client.on('clientInit', function(data) {
    var id = data.id;
    client.clientID = id;
    var session = data.session;

    // Platform
    data.platform = platform.parse(data.userAgent);
    if (data.platform.os.family.split(' ')[0].toLowerCase() == 'windows') {
      data.platform.os.family = data.platform.os.family.split(' ')[0];
    }
    data.platform.product = data.platform.product || '-';

    // Cache params
    for (var i = 0; i < data.style.length; i++) {
      var name = data.style[i].name.split('?');
      if (name.length > 1) {
        if (cacheParams.indexOf('.') !== -1) {
          data.style[i].name = name[0];
        } else {
          var params = name[1].split('&');
          newParams = [];
          for (var j = 0; j < params.length; j++) {
            if (cacheParams.indexOf(params[j].split('=')[0]) == -1) {
              newParams.push(params[j]);
            }
          }
          if (newParams.length > 0) {
            data.style[i].name = name[0] + '?' + newParams.join('&');
          } else {
            data.style[i].name = name[0];
          }
        }
      }
    }

    var hashes = {};

    calculateHashes(data.style, null, hashes);
    clients[session] = clients[session] || {};
    clients[session][id] = {
      id: id,
      platform: data.platform,
      sessions: [session],
      comm: client,
      data: data
    };
    // Notify the manager
    client.emit('clientInit', hashes);
    if (managers[session]) {
      managers[session].comm.emit('clientUpdate', data);
    }
  });

  client.on('modernizrInit', function(data) {
    clients[data.session][data.id].modernizr = data;
    // Notify the manager
  });

  client.on('managerInit', function(data) {
    // TODO Check if it already exists (id & session)
    var id = data.id;
    client.managerID = id;
    var session = data.session;
    clients[session] = clients[session] || {};
    managers[session] = {
      id: id,
      sessions: [session],
      comm: client,
      data: data
    };

    clients[session].each(function(cl) {
      client.emit('clientUpdate', cl.data);
    });

    client.emit('config', {
      version: version,
      modernizr: modernizr
    });
  });

  client.on('change', function(data) {
    data.payload.each(function(payload, deviceId) {
      if (clients[data.session] && clients[data.session][deviceId]) {
        clients[data.session][deviceId].comm.emit('change', payload);
      }
    });
  });

  client.on('disconnect', function(){
    var id, i, session;
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
            managers[session].comm.emit('clientDisconnect', id);
          }
        }
      });
    }
  });
});

function calculateHashes(style, parentHash, hashes, source) {
  parentHash = parentHash || '';
  for (var i = 0; i < style.length; i++) {

    if (style[i].type == 'import') {
      style[i].name = style[i].name.replace(/[\"\;]/g, '').trim();
    }

    var key = i + '$' + parentHash + '$' + style[i].name;
    style[i].hash = hash(key);

    if (style[i].type == 'file') {
      source = style[i].source;
    }
    hashes[style[i].hash] = {
      hash: style[i].hash,
      parentHash: parentHash,
      source: source,
      path: style[i].path,
      type: style[i].type
    };

    if (style[i].type == 'file' && style[i].name == 'inline') {
      style[i].name = 'inline#' + parseInt(style[i].hash, 16).toString(36).substr(0, 6);
    }
    if (typeof style[i].value == 'object') {
      calculateHashes(style[i].value, style[i].hash, hashes, source);
    }
  }
}

function hash(text) {
  var shasum = crypto.createHash('sha1');
  shasum.update(text);
  return shasum.digest('hex');
}