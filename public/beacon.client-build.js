/*! styl.io - v0.0.1 - 2013-12-22
* Copyright (c) 2013 ; Licensed  */
var Change = {
  exec: function(data) {
    // changeId, hash, parentHash, type, name, value, action
    Styles.nodes[Styles.types.list[data.type]][data.action](data);
  }
};
var Connection = {
  socket: null,
  init: function() {
    Connection.socket = io.connect(Utils.getURL());
  },

  on: function(tag, callback) {
    Connection.socket.on(tag, callback);
  },

  send: function(tag, message) {
    Connection.socket.emit(tag, message);
  },

  disconnect: function() {
    Connection.socket.disconnect();
    Connection.socket = null;
  }
};
var Probe = {
  check: function() {}
};
var CryptoJS=CryptoJS||function(e,m){var p={},j=p.lib={},l=function(){},f=j.Base={extend:function(a){l.prototype=this;var c=new l;a&&c.mixIn(a);c.hasOwnProperty("init")||(c.init=function(){c.$super.init.apply(this,arguments)});c.init.prototype=c;c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var c in a)a.hasOwnProperty(c)&&(this[c]=a[c]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.init.prototype.extend(this)}},
n=j.WordArray=f.extend({init:function(a,c){a=this.words=a||[];this.sigBytes=c!=m?c:4*a.length},toString:function(a){return(a||h).stringify(this)},concat:function(a){var c=this.words,q=a.words,d=this.sigBytes;a=a.sigBytes;this.clamp();if(d%4)for(var b=0;b<a;b++)c[d+b>>>2]|=(q[b>>>2]>>>24-8*(b%4)&255)<<24-8*((d+b)%4);else if(65535<q.length)for(b=0;b<a;b+=4)c[d+b>>>2]=q[b>>>2];else c.push.apply(c,q);this.sigBytes+=a;return this},clamp:function(){var a=this.words,c=this.sigBytes;a[c>>>2]&=4294967295<<
32-8*(c%4);a.length=e.ceil(c/4)},clone:function(){var a=f.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var c=[],b=0;b<a;b+=4)c.push(4294967296*e.random()|0);return new n.init(c,a)}}),b=p.enc={},h=b.Hex={stringify:function(a){var c=a.words;a=a.sigBytes;for(var b=[],d=0;d<a;d++){var f=c[d>>>2]>>>24-8*(d%4)&255;b.push((f>>>4).toString(16));b.push((f&15).toString(16))}return b.join("")},parse:function(a){for(var c=a.length,b=[],d=0;d<c;d+=2)b[d>>>3]|=parseInt(a.substr(d,
2),16)<<24-4*(d%8);return new n.init(b,c/2)}},g=b.Latin1={stringify:function(a){var c=a.words;a=a.sigBytes;for(var b=[],d=0;d<a;d++)b.push(String.fromCharCode(c[d>>>2]>>>24-8*(d%4)&255));return b.join("")},parse:function(a){for(var c=a.length,b=[],d=0;d<c;d++)b[d>>>2]|=(a.charCodeAt(d)&255)<<24-8*(d%4);return new n.init(b,c)}},r=b.Utf8={stringify:function(a){try{return decodeURIComponent(escape(g.stringify(a)))}catch(c){throw Error("Malformed UTF-8 data");}},parse:function(a){return g.parse(unescape(encodeURIComponent(a)))}},
k=j.BufferedBlockAlgorithm=f.extend({reset:function(){this._data=new n.init;this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=r.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var c=this._data,b=c.words,d=c.sigBytes,f=this.blockSize,h=d/(4*f),h=a?e.ceil(h):e.max((h|0)-this._minBufferSize,0);a=h*f;d=e.min(4*a,d);if(a){for(var g=0;g<a;g+=f)this._doProcessBlock(b,g);g=b.splice(0,a);c.sigBytes-=d}return new n.init(g,d)},clone:function(){var a=f.clone.call(this);
a._data=this._data.clone();return a},_minBufferSize:0});j.Hasher=k.extend({cfg:f.extend(),init:function(a){this.cfg=this.cfg.extend(a);this.reset()},reset:function(){k.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);return this._doFinalize()},blockSize:16,_createHelper:function(a){return function(c,b){return(new a.init(b)).finalize(c)}},_createHmacHelper:function(a){return function(b,f){return(new s.HMAC.init(a,
f)).finalize(b)}}});var s=p.algo={};return p}(Math);
(function(){var e=CryptoJS,m=e.lib,p=m.WordArray,j=m.Hasher,l=[],m=e.algo.SHA1=j.extend({_doReset:function(){this._hash=new p.init([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(f,n){for(var b=this._hash.words,h=b[0],g=b[1],e=b[2],k=b[3],j=b[4],a=0;80>a;a++){if(16>a)l[a]=f[n+a]|0;else{var c=l[a-3]^l[a-8]^l[a-14]^l[a-16];l[a]=c<<1|c>>>31}c=(h<<5|h>>>27)+j+l[a];c=20>a?c+((g&e|~g&k)+1518500249):40>a?c+((g^e^k)+1859775393):60>a?c+((g&e|g&k|e&k)-1894007588):c+((g^e^
k)-899497514);j=k;k=e;e=g<<30|g>>>2;g=h;h=c}b[0]=b[0]+h|0;b[1]=b[1]+g|0;b[2]=b[2]+e|0;b[3]=b[3]+k|0;b[4]=b[4]+j|0},_doFinalize:function(){var f=this._data,e=f.words,b=8*this._nDataBytes,h=8*f.sigBytes;e[h>>>5]|=128<<24-h%32;e[(h+64>>>9<<4)+14]=Math.floor(b/4294967296);e[(h+64>>>9<<4)+15]=b;f.sigBytes=4*e.length;this._process();return this._hash},clone:function(){var e=j.clone.call(this);e._hash=this._hash.clone();return e}});e.SHA1=j._createHelper(m);e.HmacSHA1=j._createHmacHelper(m)})();
var Startup = {
  init: function() {
    var start = (new Date()).getTime();
    Styles.all = Styles.getAll();
    var end = (new Date()).getTime();
    Utils.log('Style ' + (end - start));
    Connection.init();
    Startup.bindListeners();
    Connection.send('client:init', {
      id: Utils.getID(),
      session: Utils.getSession(),
      style: Utils.serialize(Styles.all),
      userAgent: window.navigator.userAgent
    });
  },
  bindListeners: function() {
    Connection.on('change:request', Change.exec);
    Connection.on('property:check', Probe.check);
  }
};
var Styles = {
  all: [],
  map: {},
  nodes: {},
  getAll: function() {
    var sheets = Styles.sheets.getAll();
    Styles.calculateHashes(sheets);
    return sheets;
  },
  calculateHashes: function(nodes) {
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      node.parentHash = null;
      if ('parent' in node && node.parent) {
        node.parentHash = node.parent.hash;
      }

      var key = i + '$' + node.parentHash + '$' + node.name;
      if (node.type == -3 && node.children.length) {
        // TODO: Find a way to differentiate inline stylesheets (type == -3)
        key = '$' + node.children[0].name;
      }
      node.hash = CryptoJS.SHA1(key).toString();
      Styles.map[node.hash] = node;

      if ('children' in node) {
        Styles.calculateHashes(node.children);
      }
    }
  }
};
Styles.nodes.properties = {
  get: function(node, parent) {
    var properties = [];

    for (var i = 0; i < node.length; i++) {
      var property = {
        type: -1,
        name: node[i],
        value: node.getPropertyValue(node[i]),
        important: node.getPropertyPriority && node.getPropertyPriority(node[i]) === 'important',
        parent: parent
      };
      properties.push(property);
    }

    return properties;
  },
  rename: function(data) {
    var parent = Styles.map[data.parentHash].ref;
    var style = parent.style || parent.cssStyle;
    if (style.removeProperty) {
      style.removeProperty(data.oldName);
    } else {
      style[Utils.toCamelCase(data.oldName)] = null;
    }
    if (style.setProperty) {
      style.setProperty(data.name, data.value, data.important ? 'important' : null);
    } else {
      // TODO: !important
      style[Utils.toCamelCase(data.name)] = data.value;
    }
    var next = style.getPropertyValue ? style.getPropertyValue(data.name) : style[Utils.toCamelCase(data.name)];
    Connection.send('change:response', {
      hash: data.hash,
      data: data,
      newValue: next,
      change: !!next
    });
  },
  change: function(data) {
    var parent = Styles.map[data.parentHash].ref;
    var style = parent.style || parent.cssStyle;
    var prev = style.getPropertyValue ? style.getPropertyValue(data.name) : style[Utils.toCamelCase(data.name)];
    // First remove the old property to override !important
    if (style.removeProperty) {
      style.removeProperty(data.name);
    } else {
      style[Utils.toCamelCase(data.name)] = null;
    }
    if (style.setProperty) {
      style.setProperty(data.name, data.value, data.important ? 'important' : null);
    } else {
      // TODO: !important
      style[Utils.toCamelCase(data.name)] = data.value;
    }
    var next = style.getPropertyValue ? style.getPropertyValue(data.name) : style[Utils.toCamelCase(data.name)];
    Connection.send('change:response', {
      hash: data.hash,
      data: data,
      oldValue: prev,
      newValue: next,
      change: prev !== next
    });
  }
};
Styles.sheets = {
  getAll: function() {
    var sheets = [];
    // There is probably a better way to get style and link tags in order
    var sheetList = document.styleSheets;
    for (var i = 0; i < sheetList.length; i++) {
      var node = sheetList[i];
      var sheet = {
        ref: node,
        type: node.href ? -2 : -3,
        name: node.href,
        parent: null,
        children: []
      };

      var rules = node.cssRules || node.rules;
      if (!rules) {
        // Should not happen but it does - need to check it out
        continue;
      }
      for (var j = 0; j < rules.length; j++) {
        var style = Styles.types.get(rules[j], sheet);
        if (style) {
          sheet.children.push(style);
        }
      }

      sheets.push(sheet);
    }

    return sheets;
  }
};
Styles.types = {
  list: {
    // http://wiki.csswg.org/spec/cssom-constants
    // 0: 'unknown',
    1: 'style',
    // 2: 'charset',
    // 3: 'import',
    4: 'media',
    // 5: 'fontFace',
    // 6: 'page',
    // 7: 'keyframes',
    // 8: 'keyframe',
    // 9 - **reserved** (color profile, svg/css4)
    // 10: 'namespace',
    // 11: 'counterStyle',
    // 12: 'supports',
    // 13: 'document',
    // 14: 'fontFeatureValues',
    // 15: 'viewport',
    // 16: 'regionStyle',
    // 1000: 'textTransform',
    // 1001: 'host'

    '-1': 'properties'
    // -2 - sheet - file
    // -3 - sheet - inline
  },
  get: function(node, parent) {
    var type = node.type;
    if (Styles.types.list[type]) {
        return Styles.nodes[Styles.types.list[type]].get(node, parent);
    }
  }
};
Styles.nodes.media = {
  get: function(node, parent) {
    // Utils.log('media', node);
    var media = {
      ref: node,
      type: node.type,
      name: node.media.mediaText,
      parent: parent,
      children: []
    };

    var rules = node.cssRules || node.rules;
    for (var i = 0; i < rules.length; i++) {
      var style = Styles.types.get(rules[i], media);
      if (style) {
        media.children.push(style);
      }
    }

    return media;
  }
};
Styles.nodes.style = {
  get: function(node, parent) {
    // Utils.log('style', node);
    var style = {
      ref: node,
      type: node.type,
      name: node.selectorText,
      parent: parent
    };

    style.children = Styles.nodes.properties.get(node.style, style);

    return style;
  }
};
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
    return window.appSession;
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
Startup.init();

// Start: Startup.init();
// Stop: Connection.disconnect();