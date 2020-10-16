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

const ansi = require('ansi');
const EventEmitter = require('events').EventEmitter;
const EOL = require('os').EOL;
const formatError = require('./util/formatError');

const INSTANCE_KEY = Symbol.for('org.apache.cordova.common.CordovaLogger');

/**
 * @typedef {'verbose'|'normal'|'warn'|'info'|'error'|'results'} CordovaLoggerLevel
 */

/**
 * Implements logging facility that anybody could use.
 *
 * Should not be instantiated directly! `CordovaLogger.get()` method should be
 * used instead to acquire the logger instance.
 */
class CordovaLogger {
    // Encapsulate the default logging level values with constants:
    static get VERBOSE () { return 'verbose'; }

    static get NORMAL () { return 'normal'; }

    static get WARN () { return 'warn'; }

    static get INFO () { return 'info'; }

    static get ERROR () { return 'error'; }

    static get RESULTS () { return 'results'; }

    /**
     * Static method to create new or acquire existing instance.
     *
     * @returns {CordovaLogger} Logger instance
     */
    static get () {
        // This singleton instance pattern is based on the ideas from
        // https://derickbailey.com/2016/03/09/creating-a-true-singleton-in-node-js-with-es6-symbols/
        if (Object.getOwnPropertySymbols(global).indexOf(INSTANCE_KEY) === -1) {
            global[INSTANCE_KEY] = new CordovaLogger();
        }
        return global[INSTANCE_KEY];
    }

    constructor () {
        /** @private */
        this.levels = {};
        /** @private */
        this.colors = {};
        /** @private */
        this.stdout = process.stdout;
        /** @private */
        this.stderr = process.stderr;

        /** @private */
        this.stdoutCursor = ansi(this.stdout);
        /** @private */
        this.stderrCursor = ansi(this.stderr);

        this.addLevel(CordovaLogger.VERBOSE, 1000, 'grey');
        this.addLevel(CordovaLogger.NORMAL, 2000);
        this.addLevel(CordovaLogger.WARN, 2000, 'yellow');
        this.addLevel(CordovaLogger.INFO, 3000, 'blue');
        this.addLevel(CordovaLogger.ERROR, 5000, 'red');
        this.addLevel(CordovaLogger.RESULTS, 10000);

        this.setLevel(CordovaLogger.NORMAL);
    }

    /**
     * Emits log message to process' stdout/stderr depending on message's
     * severity and current log level. If severity is less than current
     * logger's level, then the message is ignored.
     *
     * @param {CordovaLoggerLevel} logLevel - The message's log level. The
     *   logger should have corresponding level added (via logger.addLevel),
     *   otherwise `CordovaLogger.NORMAL` level will be used.
     *
     * @param {string} message - The message, that should be logged to
     *   process's stdio.
     *
     * @returns {CordovaLogger} Return the current instance, to allow chaining.
     */
    log (logLevel, message) {
        // if there is no such logLevel defined, or provided level has
        // less severity than active level, then just ignore this call and return
        if (!this.levels[logLevel] || this.levels[logLevel] < this.levels[this.logLevel]) {
            // return instance to allow to chain calls
            return this;
        }

        var isVerbose = this.logLevel === CordovaLogger.VERBOSE;
        var cursor = this.stdoutCursor;

        if (message instanceof Error || logLevel === CordovaLogger.ERROR) {
            message = formatError(message, isVerbose);
            cursor = this.stderrCursor;
        }

        var color = this.colors[logLevel];
        if (color) {
            cursor.bold().fg[color]();
        }

        cursor.write(message).reset().write(EOL);

        return this;
    }

    /**
     * Adds a new level to logger instance.
     *
     * This method also creates a shortcut method to log events with the level
     * provided.
     * (i.e. after adding new level 'debug', the method `logger.debug(message)`
     * will exist, equal to `logger.log('debug', message)`)
     *
     * @param {CordovaLoggerLevel} level - A log level name. The levels with
     *   the following names are added by default to every instance: 'verbose',
     *   'normal', 'warn', 'info', 'error', 'results'.
     *
     * @param {number} severity - A number that represents level's severity.
     *
     * @param {string} color - A valid color name, that will be used to log
     *   messages with this level. Any CSS color code or RGB value is allowed
     *   (according to ansi documentation:
     *   https://github.com/TooTallNate/ansi.js#features).
     *
     * @returns {CordovaLogger} Return the current instance, to allow chaining.
     */
    addLevel (level, severity, color) {
        this.levels[level] = severity;

        if (color) {
            this.colors[level] = color;
        }

        // Define own method with corresponding name
        if (!this[level]) {
            Object.defineProperty(this, level, {
                get () { return this.log.bind(this, level); }
            });
        }

        return this;
    }

    /**
     * Sets the current logger level to provided value.
     *
     * If logger doesn't have level with this name, `CordovaLogger.NORMAL` will
     * be used.
     *
     * @param {CordovaLoggerLevel} logLevel - Level name. The level with this
     *   name should be added to logger before.
     *
     * @returns {CordovaLogger} Current instance, to allow chaining.
     */
    setLevel (logLevel) {
        this.logLevel = this.levels[logLevel] ? logLevel : CordovaLogger.NORMAL;

        return this;
    }

    /**
     * Adjusts the current logger level according to the passed options.
     *
     * @param {Object|Array<string>} opts - An object or args array with
     *   options.
     *
     * @returns {CordovaLogger} Current instance, to allow chaining.
     */
    adjustLevel (opts) {
        if (opts.verbose || (Array.isArray(opts) && opts.includes('--verbose'))) {
            this.setLevel('verbose');
        } else if (opts.silent || (Array.isArray(opts) && opts.includes('--silent'))) {
            this.setLevel('error');
        }

        return this;
    }

    /**
     * Attaches logger to EventEmitter instance provided.
     *
     * @param {EventEmitter} eventEmitter - An EventEmitter instance to attach
     *   the logger to.
     *
     * @returns {CordovaLogger} Current instance, to allow chaining.
     */
    subscribe (eventEmitter) {
        if (!(eventEmitter instanceof EventEmitter)) {
            throw new Error('Subscribe method only accepts an EventEmitter instance as argument');
        }

        eventEmitter.on('verbose', this.verbose)
            .on('log', this.normal)
            .on('info', this.info)
            .on('warn', this.warn)
            .on('warning', this.warn)
            // Set up event handlers for logging and results emitted as events.
            .on('results', this.results);

        return this;
    }
}

module.exports = CordovaLogger;
