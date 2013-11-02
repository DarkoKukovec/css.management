// Script parameter detection based on
// https://gist.github.com/cphoover/6228063

function getScript() {
  var parseUrl = function(url) {
    return {
      original: url,
      host: url.split('//')[1].split('/')[0],
      session: url.split('#')[1].split(':')[0]
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
  return parseUrl(stack);
}

window.addEventListener('load', function() {
  var header = document.getElementsByTagName('head')[0];
  var urlData = getScript();
  var baseUrl = urlData.host;
  window.appSession = urlData.session;

  // Load socket.io
  var io = document.createElement('script');
  io.addEventListener('load', function() {
    // Load client
    var client = document.createElement('script');
    client.type = 'text/javascript';
    client.src = 'http://' + baseUrl + '/beacon.client-build.js';
    header.appendChild(client);
  });
  io.type = 'text/javascript';
  io.src = 'http://' + baseUrl + '/socket.io/socket.io.js';
  header.appendChild(io);
});