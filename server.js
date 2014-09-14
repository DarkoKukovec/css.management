var version = 'v0.1.0';
var appName = 'styl.io';

var utils = require('./server/utils.js');
var server = require('./server/startup.js')(appName, version);
var comm = require('./server/communication.js')(server, utils);
