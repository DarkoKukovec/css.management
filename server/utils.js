var platform = require('platform');
var crypto = require('crypto');

Object.prototype.each = function(callback) {
  for (var key in this) {
    if (this.hasOwnProperty(key)) {
      callback(this[key], key);
    }
  }
};

function removeParams(style) {
  var name = style.name.split('?');
  if (name.length > 1) {
    if (cacheParams.indexOf('.') !== -1) {
      style.name = name[0];
    } else {
      var params = name[1].split('&');
      newParams = [];
      for (var j = 0; j < params.length; j++) {
        if (cacheParams.indexOf(params[j].split('=')[0]) == -1) {
          newParams.push(params[j]);
        }
      }
      if (newParams.length > 0) {
        style.name = name[0] + '?' + newParams.join('&');
      } else {
        style.name = name[0];
      }
    }
  }
}

function getPlatformInfo(userAgent) {
  var platform = platform.parse(userAgent);
  if (platform.os.family.split(' ')[0].toLowerCase() == 'windows') {
    platform.os.family = platform.os.family.split(' ')[0];
  }
  platform.product = platform.product || '-';
  return platform;
}

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