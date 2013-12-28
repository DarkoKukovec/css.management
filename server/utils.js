var platform = require('platform');

Object.prototype.each = function(callback) {
  for (var key in this) {
    if (this.hasOwnProperty(key)) {
      callback(this[key], key);
    }
  }
};

removeParams = function(style) {
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
};

getPlatformInfo = function(userAgent) {
  var platformInfo = platform.parse(userAgent);
  if (platformInfo.os.family.split(' ')[0].toLowerCase() == 'windows') {
    platformInfo.os.family = platformInfo.os.family.split(' ')[0];
  }
  platformInfo.product = platformInfo.product || '-';
  return platformInfo;
};

normalizeNodes = function(style) {
  for (var i = 0; i < style.length; i++) {

    if (style[i].type == 'import') {
      style[i].name = style[i].name.replace(/[\"\;]/g, '').trim();
    }

    if (style[i].type == -3) {
      style[i].name = 'inline#' + style[i].hash.substr(0, 6);
    }
    if ('children' in style[i]) {
      normalizeNodes(style[i].children);
    }
  }
};

updateNode = function(style, nodeHash, nodeName, nodeValue) {
  for (var i = 0; i < style.length; i++) {

    if (style[i].hash == nodeHash) {
      style[i].name = nodeName;
      style[i].value = nodeValue;
      return true;
    }

    if ('children' in style[i]) {
      updateNode(style[i].children, nodeHash, nodeName, nodeValue);
    }
  }
};