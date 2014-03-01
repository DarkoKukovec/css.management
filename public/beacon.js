// Script parameter detection based on
// https://gist.github.com/cphoover/6228063

function getScript() {
  var parseUrl = function(url) {
    var realUrl = url;
    for (var i = 0; i < document.scripts.length; i++) {
      if (document.scripts[i].src.indexOf(url) === 0) {
        realUrl = document.scripts[i].src;
        break;
      }
    }
    return {
      original: url,
      host: url.split('//')[1].split('/')[0],
      session: realUrl.split('#')[1].split(':')[0]
    };
  };

  var stack;
  try {
      WhatKindOfSorceryIsThis;
  } catch(e) {
      stack = e.stack;
  }

  if (!stack)
      return undefined;

  var e = stack.indexOf(' at ') !== -1 ? ' at ' : '@';
  while (stack.indexOf(e) !== -1) {
    stack = stack.substring(stack.indexOf(e) + e.length);
  }
  stack = stack.split('/');
  var last = stack.pop().split(':');
  stack.push(last[0]);
  return parseUrl(stack.join('/'));
}

// Fire on load or immediately if load already happened
// http://stackoverflow.com/questions/1523343/has-window-onload-fired-yet
// Not sure if this works everywhere...
window.setTimeout(function() {
  var header = document.getElementsByTagName('head')[0];
  var urlData = getScript();
  var baseUrl = urlData.host;
  window.appSession = urlData.session;
  window.appHost = urlData.host;

  var beaconLoad = function() {
    // Load client
    var client = document.createElement('script');
    client.type = 'text/javascript';
    client.src = 'http://' + baseUrl + '/beacon.client-build.js';
    header.appendChild(client);
  };

  if (typeof window.io === 'undefined') {
    // Load socket.io
    var io = document.createElement('script');
    io.addEventListener('load', beaconLoad);
    io.type = 'text/javascript';
    io.src = 'http://' + baseUrl + '/socket.io/socket.io.js';
    header.appendChild(io);
  } else {
    beaconLoad();
  }
}, 0);
