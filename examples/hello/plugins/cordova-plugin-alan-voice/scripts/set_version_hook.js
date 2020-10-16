var fs = require('fs');
var path = require('path');
var deferral = require("q").defer();

module.exports = function(ctx) {

    var pluginVersion = ctx.opts.plugin.pluginInfo.version;

    var pluginRoot = path.join(ctx.opts.projectRoot, 'plugins/cordova-plugin-alan-voice/src');

    var androidFile = "package cordova.plugin.alan;\n\n" +
                        "public class Version {\n\n" +
                    "\tpublic static final String NUMBER = \"" + pluginVersion + "\";\n" +
                    "\tprivate Version() {}\n" +
                    "}";

    var iosFile = "const NSString* pluginVersion = @\"" + pluginVersion + "\";";


    fs.writeFile(path.join(pluginRoot, "android/Version.java"), androidFile, { flag: 'w' }, function(err) {
	    if(err) {
	        return console.log(err);
	    }
	    console.log("Android version set to " + pluginVersion);
	}); 

    fs.writeFileSync(path.join(pluginRoot, "ios/AlanVersion.h"), iosFile, { flag: 'w' });

	deferral.resolve();
    return deferral.promise;
};
