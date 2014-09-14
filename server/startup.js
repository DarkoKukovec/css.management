var connect = require('connect');
var serveStatic = require('serve-static');
var io = require('socket.io');

module.exports = function(appName, version) {
  // Parse arguments
  var port = 3000;
  var cacheParams = [];
  modernizr = false;
  for (var i = 0; i < process.argv.length; i++) {
    var p = process.argv[i];
    if (p == '-p' || p == '--port') {
      try {
        port = parseInt(process.argv[i + 1], 10) || port;
        i++;
      } catch(e) {}
    }
    if (p == '-c' || p == '--cacheParam') {
      try {
        cacheParams.push(process.argv[i + 1]);
        i++;
      } catch(e) {}
    }
    if (p == '-v' || p == '--version') {
      console.log(version);
      return;
    }
    // if (p == '-m' || p == '--modernizr') {
    //   modernizr = true;
    // }
    if (p == '-h' || p == '--help') {
      console.log(appName);
      console.log('\t-h --help\tHelp');
      console.log('\t-v --version\tVersion');
      console.log('\t-p --port\tThe port the server is running (default ' + port + ')');
      console.log('\t-c --cacheParam\tName of the cache parameter in the CSS URL-s');
      console.log('\t\t\tIt will be ignored when comparing the URL-s');
      console.log('\t\t\tIt can be used multiple times to remove multiple params');
      console.log('\t\t\tUse "." to remove all params');
      // console.log('\t-m --modernizr\tUse modernizr');
      return;
    }
  }

  // File server
  console.info('Starting server on port ' + port);
  if (cacheParams.length) {
    console.log('Ignoring cache parameters ' + cacheParams.join(', '));
  }
  // console.log('Modernizr ' + (modernizr ? 'enabled' : 'disabled'));
  var server = connect()
    .use(serveStatic('public'))
    .listen(port);

  //Socket.IO
  var socket = io.listen(server);
  return {
    appName: appName,
    version: version,
    modernizr: modernizr,
    socket: socket
  };
}
