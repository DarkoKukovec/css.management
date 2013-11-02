var Utils = {
  getURL: function() {
    var rawURL = document.getElementById('StylIO-beacon').src.split('/');
    rawURL.pop();
    return rawURL.join('/');
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
    var url = document.getElementById('StylIO-beacon').src.split('#');
    return url.length > 1 ? url[1] : '';
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
  serialize: function(nodes) {
    // Remove circural references so the object can be sent to the server
    var sl = [];
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var s = {};
      for (var key in node) {
        if (node.hasOwnProperty(key)) {
          if (key === 'ref' || key === 'parent') {
            continue;
          } else if (key === 'children') {
            s.children = Utils.serialize(node.children);
          } else {
            s[key] = node[key];
          }
        }
      }
      sl.push(s);
    }
    return sl;
  },
  trim: function(string) {
    // Not all browsers support the trim funcions and we don't want to mess with the prototype
    return string.replace(/^\s+|\s+$/g, '');
  },
  log: function() {
    if ('console' in window && 'log' in console) {
      // http://www.paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
      console.log(Array.prototype.slice.call(arguments));
    } else {
      alert([].concat(arguments).join(' '));
    }
  },
  toCamelCase: function(property) {
    var p = property.split('-');
    var prop = p.shift();
    while(p.length) {
      var part = p.shift();
      prop += part.charAt(0).toUpperCase() + part.substr(1);
    }
    return prop;
  }
};