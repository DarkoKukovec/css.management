define([], function() {

  var updateNumericValue = function(e, el) {
    if (e.type != 'keydown') {
      return true;
    }
    var action = 0;
    if (e.keyCode == 38) {
      if (e.shiftKey) {
        action = 10;
      } else if (e.altKey) {
        action = 0.1;
      } else {
        action = 1;
      }
    } else if (e.keyCode == 40) {
      if (e.shiftKey) {
        action = -10;
      } else if (e.altKey) {
        action = -0.1;
      } else {
        action = -1;
      }
    }

    if (action) {
      var value = $(el).val();
      var position = getCursorPosition(el);
      var parsed = getNumberPosition(value, position);
      if (parsed) {
        parsed[1] = (Math.round((parseFloat(parsed[1], 10) + action) * 1000)) / 1000;
        value = parsed.join('');
        $(el).val(value);
        setCursorPosition(el, position);
      }

      e.preventDefault();
      return false;
    }
    return true;
  };
  var getNumberPosition = function(value, position) {
    var before = value.substr(0, position).split(' ');
    var after = value.substr(position, value.length).split(' ');
    var start, end, current = '', result = [];
    if (before[before.length - 1].trim() == before[before.length - 1]) {
      current += before.pop();
    }
    before = before.join(' ');
    if (before.length) {
      before += ' ';
    }
    if (after[0].trim() == after[0]) {
      current += after.shift();
    }
    after = after.join(' ');
    if (after.length) {
      after = ' ' + after;
    }
    var offsetPosition = position - before.length;

    var matches = current.match(/\-?\d*\.?\d+/g);
    if (!matches) {
      return false;
    }
    if (matches.length == 1) {
      start = current.indexOf(matches[0], offset);
      end = start + matches[0].length;
      result.push(before + current.substr(0, start), matches[0], current.substr(end, current.length) + after);
      return result;
    }
    var offset = 0;
    for (var i = 0; i < matches.length; i++) {
      start = current.indexOf(matches[i], offset);
      end = start + matches[i].length;
      if (offsetPosition >= start && offsetPosition <= end) {
        result.push(before + current.substr(0, start), matches[i], current.substr(end, current.length) + after);
        return result;
      } else {
        offset = end;
      }
    }
    return false;
  };
  var getCursorPosition = function(el) {
    var position = 0;

    if (document.selection) {
      el.focus();
      var oSel = document.selection.createRange();
      oSel.moveStart('character', -el.value.length);
      position = oSel.text.length;
    }

    else if (el.selectionStart || el.selectionStart == '0') {
      position = el.selectionStart;
    }

    return position;
  };
  var setCursorPosition = function(el, position) {
    if(!el) {
      return false;
    } else if(el.createTextRange) {
      var textRange = el.createTextRange();
      textRange.collapse(true);
      textRange.moveEnd(position);
      textRange.moveStart(position);
      textRange.select();
      return true;
    } else if (el.setSelectionRange) {
      el.setSelectionRange(position,position);
      return true;
    }
    return false;
  };

  return {
    update: updateNumericValue
  };
});