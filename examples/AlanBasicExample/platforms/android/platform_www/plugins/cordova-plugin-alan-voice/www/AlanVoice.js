cordova.define("cordova-plugin-alan-voice.AlanVoice", function(require, exports, module) {

var exec = require('cordova/exec');

var PLUGIN_NAME = 'AlanVoice';

var AlanVoice = {
  addButton: function(cb) {
    exec(cb, null, PLUGIN_NAME, 'addButton', []);
  }
};

module.exports = AlanVoice;

});
