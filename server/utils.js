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

normalizeNodes = function(style, map, revertCallback) {
  for (var i = 0; i < style.length; i++) {

    if (style[i].type == 'import') {
      style[i].name = style[i].name.replace(/[\"\;]/g, '').trim();
    }

    if (style[i].type == -3) {
      style[i].name = 'inline#' + style[i].hash.substr(0, 6);
    }
    var node = map[style[i].hash];
    if (node) {
      // Set the received values as original but revert them on the client to old ones if they changed in the meantime
      // Idea:
      //  if original is same as before -> revert to the current state
      //  else ignore
      var change = false;
      var ignore = false;

      if (node.originalName !== style[i].name) {
        ignore = true;
        node.originalName = node.name = style[i].name;
      } else if (node.name !== style[i].name) {
        style[i].name = node.name;
        change = true;
      }

      if (node.originalValue !== style[i].value) {
        ignore = true;
        node.originalValue = node.value = style[i].value;
      } else if (node.value !== style[i].value) {
        style[i].value = node.value;
        change = true;
      }

      if (node.originalImportant !== style[i].important) {
        ignore = true;
        node.originalImportant = node.important = style[i].important;
      } else if (node.important !== style[i].important) {
        style[i].important = node.important;
        change = true;
      }

      if (change && !ignore) {
        revertCallback(node);
      }
    } else {
      map[style[i].hash] = {
        hash: style[i].hash,
        parentHash: style[i].parentHash,
        originalName: style[i].name,
        originalValue: style[i].value,
        originalImportant: style[i].important,
        name: style[i].name,
        value: style[i].value,
        important: style[i].important,
        type: style[i].type
      };
    }
    if ('children' in style[i]) {
      normalizeNodes(style[i].children, map, revertCallback);
    }
  }
};

updateNode = function(style, nodeHash, nodeName, nodeValue, enabled) {
  for (var i = 0; i < style.length; i++) {

    if (style[i].hash == nodeHash) {
      if (enabled) {
        style[i].name = nodeName;
        style[i].value = nodeValue;
        style[i].enabled = enabled;
      } else {
        style[i].enabled = false;
      }
      return true;
    }

    if ('children' in style[i]) {
      updateNode(style[i].children, nodeHash, nodeName, nodeValue, enabled);
    }
  }
};