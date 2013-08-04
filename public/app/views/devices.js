define([
  'app',
  'views/abstract/list',
  'views/device'
],

function(app, List, Item) {
  'use strict';
  var DevicesList = List.extend({
    tagName: 'ul',
    className: 'devices-list',
    singleItem: Item,

    render: function() {
      return this;
    },

    cleanup: function() {
    }
  });

  return DevicesList;
});