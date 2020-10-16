
var exec = require('cordova/exec');

var PLUGIN_NAME = 'AlanVoice';

var AlanVoice = {
  addButton: function(cb) {
    exec(cb, null, PLUGIN_NAME, 'addButton', []);
  }
};

module.exports = AlanVoice;
