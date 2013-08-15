StylIO = (function(window) {
  var rawURL;
  var styleData;

  var Comm = {
    socket: null,
    connect: function() {
      Comm.socket = io.connect(Utils.getURL());
    },

    on: function(tag, callback) {
      Comm.socket.on(tag, callback);
    },

    send: function(tag, message) {
      Comm.socket.emit(tag, message);
    },

    disconnect: function() {
      Comm.socket.disconnect();
    }
  };

  var Startup = {
    init: function() {
      rawURL = document.getElementById('StylIO-beacon').src;
      Comm.connect();
      styleData = {};
      Startup.setupListeners();
      Startup.serverInit();
      // Startup.ping();
    },
    serverInit: function() {
      var styling = CSS.getCSS();
      Comm.send('client:init', {
        id: Utils.getID(),
        session: Utils.getSession(),
        userAgent: window.navigator.userAgent,
        style: styling
      });
    },
    setupListeners: function() {
      Comm.on('client:init', function(data) {
        window.styleData = styleData = data;
      });

      Comm.on('change:request', function(data) {
        data = [].concat(data);
        for (var i = 0; i < data.length; i++) {
          var node;
          if (data[i].type == 'add') {
            node = styleData[data[i].parentHash];
          } else {
            node = styleData[data[i].hash];
          }
          if (node) {
            Node[data[i].type]({
              node: node,
              type: data[i].elementType,
              source: node.source,
              path: node.path,
              parentHash: node.parentHash,
              hash: data[i].hash,
              oldName: data[i].oldName,
              name: data[i].name,
              value: data[i].value
            });
          }
        }
      });
    },
    ping: function() {
      Comm.send('ping', {});
      Comm.on('pong', function() {
        setTimeout(Startup.ping, 1000);
      });
    }
  };

  var CSS = {
    getCSS: function() {
      var files = [];
      var sheets = document.styleSheets;
      for (var i = 0; i < sheets.length; i++) {
        var href = Utils.getPath(sheets[i].href);
        files.push({
          type: href ? 'file' : 'inline',
          name: href,
          source: i,
          value: CSS.getRules(sheets[i].rules || sheets[i].cssRules, [])
        });
      }
      return files;
    },

    getRules: function(ruleList, path) {
      var rules = [];
      ruleList = ruleList || [];
      for (var i = 0; i < ruleList.length; i++) {
        var rulePath = [].concat(path);
        rulePath.push(i);
        if (ruleList[i].type == 4) {
          rules.push({
            type: 'media',
            name: ruleList[i].media.mediaText,
            path: rulePath,
            value: CSS.getRules(ruleList[i].cssRules, rulePath.concat('cssRules'))
          });
        } else if (ruleList[i].type == 3) {
          rules.push({
            type: 'import',
            name: ruleList[i].cssText,
            path: rulePath,
            value: CSS.getRules(ruleList[i].styleSheet.cssRules, rulePath.concat(['styleSheet', 'cssRules']))
          });
        } else if (ruleList[i].type == 2) {
          rules.push({
            type: 'charset',
            name: ruleList[i].cssText,
            path: rulePath,
            value: ruleList[i].encoding
          });
        } else {
          rules.push({
            type: 'selector',
            name: ruleList[i].selectorText,
            path: rulePath,
            value: CSS.getProperties(ruleList[i].style, rulePath.concat('style'))
          });
        }
      }
      return rules;
    },
    getProperties: function(selector, path) {
      var properties = [];
      for (var name in selector) {
        if (!selector.getPropertyValue && !Utils.isNumeric(name) && name != 'cssText') {
          var value = selector[name];
          if (value && (typeof value == 'string' || typeof value == 'numeric')) {
            name = Utils.toNormalCase(name);
            properties.push({
              type: 'property',
              name: Utils.toNormalCase(name),
              path: path,
              value: value
            });
          }
        } else if (Utils.isNumeric(name)) {
          // Android browser. All others except IE would work this way too
          properties.push({
            type: 'property',
            name: selector[name],
            path: path,
            value: selector.getPropertyValue(selector[name])
          });
        }
      }
      return properties;
    },
    getSource: function(source) {
      var sheet = document.styleSheets[source];
      return sheet.rules || sheet.cssRules;
    },
    getRealSource: function(source, path) {
      for (var i = 0; i < path.length; i++) {
        logger(source, path[i]);
        source = source[path[i]] || source;
        if (i < path.length - 1) {
          if (source.type == 3) { // @import
            source = source.styleSheet.cssRules || source.styleSheet.rules || source.styleSheet || source;
          } else if (source.type == 4) { // @media
            source = source.cssRules || source.rules || source;
          }
        }
      }
      return source;
    }
  };

  var Utils = {
    getURL: function() {
      return rawURL.replace('beacon.js', '');
    },
    getID: function() {
      var id = Utils.getCookie('clientID');
      if (!id) {
        id = Math.round(Math.random() * 1e15).toString(36);
        Utils.setCookie('clientID', id);
      }
      return id;
    },
    getSession: function() {
      var url = rawURL.split('#');
      return url.length ? url[1] : '';
    },
    getPath: function(url) {
      if (!url) {
        return 'inline';
      }
      if (url.indexOf('://') != -1) {
        url = url.split('://')[1];
        var i = url.indexOf('/');
        if (i != -1) {
          url = url.substr(i + 1);
        }
      }
      if (url.indexOf('//') === 0) {
        url = url.substr(2);
        var j = url.indexOf('/');
        if (j != -1) {
          url = url.substr(j + 1);
        }
      }
      return url;
    },
    getCookie: function(name) {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].split('=');
        if (Utils.trim(cookie[0]) == name) {
          return Utils.trim(cookie[1]);
        }
      }
      return undefined;
    },
    setCookie: function(name, value) {
      document.cookie = name + '=' + value;
    },
    isNumeric: function(string) {
      var num = parseInt(string, 10);
      return num.toString() == string;
    },
    toCamelCase: function(property) {
      property = property.split('-');
      var cc = property[0];

      for (var i = 1; i < property.length; i++) {
        cc += property[i].charAt(0).toUpperCase() + property[i].substr(1);
      }

      return cc;
    },
    toNormalCase: function(property) {
      return property.replace(/[A-Z]/g, function(match) { return '-' + match.toLowerCase(); });
    },
    trim: function(string) {
      // Not all browsers support the trim funcions and we don't want to mess with the prototype
      return string.replace(/^\s+|\s+$/g, '');
    },
    getLast: function(array) {
      return array[array.length - 1];
    }
  };

  var Node = {
    'add': function(data) {
      var source = CSS.getSource(data.node.source);
      var parent;

      logger('add', data);

      // property
      if (data.type == 'property') {
        parent = data.node;
        source = CSS.getRealSource(source, parent.path);
        if (source.style.setProperty) {
          source.style.setProperty(data.name, data.value);
        } else {
          source.style[Util.toCamelCase(data.name)] = data.value;
        }
        styleData[data.hash] = {
          hash: data.hash,
          path: parent.path,
          parentHash: parent.hash,
          type: 'property',
          source: data.node.source
        };
      }

      if (data.type == 'selector') {
        if (data.node.type == 'file') {
          source = document.styleSheets[data.node.source];
        }
        parent = data.node;
        parent.path = parent.path || [];
        source = CSS.getRealSource(source, parent.path);
        if (data.node.type == 'import') {
          source = source.styleSheet;
        }
        var newRule = data.name + ' {}';
        var index = (source.rules || source.cssRules).length;
        if (source.insertRule) {
          source.insertRule(newRule, index);
        } else {
          source.addRule(newRule, index);
        }
        path = parent.path.concat(index);
        styleData[data.hash] = {
          hash: data.hash,
          path: path,
          parentHash: parent.hash,
          type: 'selector',
          source: data.node.source
        };
      }

    },
    'update': function(data) {
      try {
        var source = CSS.getSource(data.node.source);
        source = CSS.getRealSource(source, data.path);

        // property
        // Some compatibility problems - try with style and without
        // All browsers should work with =, but if it's available, use setProperty
        if (data.type == 'property') {
          if (source.setProperty) {
            source.setProperty(data.name, data.value);
          } else if (source.style && source.style.setProperty) {
            source.style.setProperty(data.name, data.value);
          } else if (source.style) {
            source.style[Utils.toCamelCase(data.name)] = data.value;
          } else {
            source[Utils.toCamelCase(data.name)] = data.value;
          }
        }
      } catch(e) {
        // Catch the exception so the client stays connected
        logger('Wrong!!!', e);
      }
    },
    'rename': function(data) {
      // try {
        var source = CSS.getSource(data.node.source);
        source = CSS.getRealSource(source, data.path);

        // if property: remove property, add a new one
        if (data.type == 'property') {
          var newName = data.name;
          data.name = data.oldName;
          Node.remove(data);
          data.name = newName;
          data.node = styleData[data.parentHash];
          Node.add(data);
        } else if (data.type == 'selector') {
          Node.renameRule(Utils.getLast(data.path), source, data.name);
        } else if (data.type == 'media') {
          source.media.mediaText = data.name;
        }
      // } catch(e) {
      //   // Catch the exception so the client stays connected
      //   logger('Wrong!!!', e);
      // }
    },
    'remove': function(data) {
      try {
        var source = CSS.getSource(data.node.source);
        source = CSS.getRealSource(source, data.path);

        // property
        if (data.type == 'property') {
          if (source.removeProperty) {
            source.removeProperty(data.name);
          } else if (source.style.removeProperty) {
            source.style.removeProperty(data.name);
          } else if (source.style) {
            source.style[Utils.toCamelCase(data.name)] = null;
          } else {
            source[Utils.toCamelCase(data.name)] = null;
          }
        } else if (data.type == 'selector') {
          Node.renameRule(Utils.getLast(data.path), source, 'StylIO_Deleted_Selector');
        } else if (data.type == 'media') {
          source.media.mediaText = 'StylIO_Deleted_Media';
        }
      } catch(e) {
        // Catch the exception so the client stays connected
        logger('Wrong!!!', e);
      }
    },
    renameRule: function(index, rule, newName) {
      var parent = rule.parentStyleSheet;
      var newRule = newName + rule.cssText.substr(rule.selectorText.length);
      if (parent.removeRule) {
        parent.removeRule(index);
      } else {
        parent.deleteRule(index);
      }
      if (parent.insertRule) {
        parent.insertRule(newRule, index);
      } else {
        parent.addRule(newRule, index);
      }
    }
  };

  Startup.init();

  function logger() {
    if ('console' in window && 'log' in console) {
      // http://www.paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
      console.log(Array.prototype.slice.call(arguments));
    } else {
      alert([].concat(arguments).join(' '));
    }
  }

  window.logger = logger;

  return {
    start: Startup.init,
    stop: function() {
      Comm.disconnect();
    }
  };
})(window);