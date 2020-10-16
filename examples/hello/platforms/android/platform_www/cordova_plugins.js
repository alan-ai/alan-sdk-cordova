cordova.define('cordova/plugin_list', function(require, exports, module) {
  module.exports = [
    {
      "id": "cordova-plugin-alan-voice.AlanVoice",
      "file": "plugins/cordova-plugin-alan-voice/www/AlanVoice.js",
      "pluginId": "cordova-plugin-alan-voice",
      "clobbers": [
        "AlanVoice"
      ]
    }
  ];
  module.exports.metadata = {
    "cordova-plugin-whitelist": "1.3.4",
    "cordova-plugin-alan-voice": "1.6.0"
  };
});