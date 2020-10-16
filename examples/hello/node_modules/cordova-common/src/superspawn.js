/**
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
*/

var crossSpawn = require('cross-spawn');
var fs = require('fs-extra');
var _ = require('underscore');
var Q = require('q');
var events = require('./events');
var iswin32 = process.platform === 'win32';

/**
 * A special implementation for child_process.spawn that handles
 *   Windows-specific issues with batch files and spaces in paths. Returns a
 *   promise that succeeds only for return code 0. It is also possible to
 *   subscribe on spawned process' stdout and stderr streams using progress
 *   handler for resultant promise.
 *
 * @example spawn('mycommand', [], {stdio: 'pipe'}) .progress(function (stdio){
 *   if (stdio.stderr) { console.error(stdio.stderr); } })
 *   .then(function(result){ // do other stuff })
 *
 * @param   {String}   cmd       A command to spawn
 * @param   {String[]} [args=[]]  An array of arguments, passed to spawned
 *   process
 * @param   {Object}   [opts={}]  A configuration object
 * @param   {String|String[]|Object} opts.stdio Property that configures how
 *   spawned process' stdio will behave. Has the same meaning and possible
 *   values as 'stdio' options for child_process.spawn method
 *   (https://nodejs.org/api/child_process.html#child_process_options_stdio).
 * @param {Object}     [env={}]  A map of extra environment variables
 * @param {String}     [cwd=process.cwd()]  Working directory for the command
 * @param {Boolean}    [chmod=false]  If truthy, will attempt to set the execute
 *   bit before executing on non-Windows platforms
 *
 * @return  {Promise}        A promise that is either fulfilled if the spawned
 *   process is exited with zero error code or rejected otherwise. If the
 *   'stdio' option set to 'default' or 'pipe', the promise also emits progress
 *   messages with the following contents:
 *   {
 *       'stdout': ...,
 *       'stderr': ...
 *   }
 */
exports.spawn = function (cmd, args, opts) {
    args = args || [];
    opts = opts || {};
    var spawnOpts = {};
    var d = Q.defer();

    if (opts.stdio !== 'default') {
        // Ignore 'default' value for stdio because it corresponds to child_process's default 'pipe' option
        spawnOpts.stdio = opts.stdio;
    }

    if (opts.cwd) {
        spawnOpts.cwd = opts.cwd;
    }

    if (opts.env) {
        spawnOpts.env = _.extend(_.extend({}, process.env), opts.env);
    }

    if (opts.chmod && !iswin32) {
        try {
            // This fails when module is installed in a system directory (e.g. via sudo npm install)
            fs.chmodSync(cmd, '755');
        } catch (e) {
            // If the perms weren't set right, then this will come as an error upon execution.
        }
    }

    events.emit(opts.printCommand ? 'log' : 'verbose', 'Running command: ' + cmd + ' ' + args.join(' '));

    // At least until Node.js 8, child_process.spawn will throw exceptions
    // instead of emitting error events in certain cases (like EACCES), Thus we
    // have to wrap the execution in try/catch to convert them into rejections.
    try {
        var child = crossSpawn.spawn(cmd, args, spawnOpts);
    } catch (e) {
        whenDone(e);
        return d.promise;
    }
    var capturedOut = '';
    var capturedErr = '';

    if (child.stdout) {
        child.stdout.setEncoding('utf8');
        child.stdout.on('data', function (data) {
            capturedOut += data;
            d.notify({ stdout: data });
        });
    }

    if (child.stderr) {
        child.stderr.setEncoding('utf8');
        child.stderr.on('data', function (data) {
            capturedErr += data;
            d.notify({ stderr: data });
        });
    }

    child.on('close', whenDone);
    child.on('error', whenDone);
    function whenDone (arg) {
        if (child) {
            child.removeListener('close', whenDone);
            child.removeListener('error', whenDone);
        }
        var code = typeof arg === 'number' ? arg : arg && arg.code;

        events.emit('verbose', 'Command finished with error code ' + code + ': ' + cmd + ' ' + args);
        if (code === 0) {
            d.resolve(capturedOut.trim());
        } else {
            var errMsg = cmd + ': Command failed with exit code ' + code;
            if (capturedErr) {
                errMsg += ' Error output:\n' + capturedErr.trim();
            }
            var err = new Error(errMsg);
            if (capturedErr) {
                err.stderr = capturedErr;
            }
            if (capturedOut) {
                err.stdout = capturedOut;
            }
            err.code = code;
            d.reject(err);
        }
    }

    return d.promise;
};

exports.maybeSpawn = function (cmd, args, opts) {
    if (fs.existsSync(cmd)) {
        return exports.spawn(cmd, args, opts);
    }
    return Q(null);
};
