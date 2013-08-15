window.addEventListener('load', function() {
  var header = document.getElementsByTagName('head')[0];
  var baseUrl = getBaseUrl();

  // Load socket.io
  var io = document.createElement('script');
  io.type = 'text/javascript';
  io.src = baseUrl + '/socket.io/socket.io.js';
  header.appendChild(io);

  // Load client
  var client = document.createElement('script');
  client.type = 'text/javascript';
  client.src = baseUrl + '/beacon.client-build.js';
  header.appendChild(client);

  // Get the styl.io base url
  function getBaseUrl() {
    var rawURL = document.getElementById('StylIO-beacon').src.split('/');
    rawURL.pop();
    return rawURL.join('/');
  }
});