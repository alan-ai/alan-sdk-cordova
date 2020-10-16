/*
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

const CordovaError = require('../CordovaError/CordovaError');

/**
 * Formats an error for logging.
 *
 * @param {Error} error - The error to be formatted.
 * @param {boolean} isVerbose - Whether the include additional debugging
 *   information when formatting the error.
 *
 * @returns {string} The formatted error message.
 */
module.exports = function formatError (error, isVerbose) {
    var message = '';

    if (error instanceof CordovaError) {
        message = error.toString(isVerbose);
    } else if (error instanceof Error) {
        if (isVerbose) {
            message = error.stack;
        } else {
            message = error.message;
        }
    } else {
        // Plain text error message
        message = error;
    }

    if (typeof message === 'string' && !message.toUpperCase().startsWith('ERROR:')) {
        // Needed for backward compatibility with external tools
        message = 'Error: ' + message;
    }

    return message;
};
