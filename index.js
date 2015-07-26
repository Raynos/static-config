'use strict';

var assert = require('assert');
var fs = require('fs');

module.exports = StaticConfig;

function StaticConfig(options) {
    if (!(this instanceof StaticConfig)) {
        return new StaticConfig(options);
    }

    var self = this;

    assert(options && options.files, 'must pass in options.files');

    self._seedConfig = options.seedConfig;
    self._files = options.files;
    self._configValues = Object.create(null);

    self._frozen = false;
    self._destroyed = false;

    self._initializeConfigValues();
}

StaticConfig.prototype.get = function get(key) {
    var self = this;

    if (!(key in self._configValues)) {
        throw new Error('Key not available: ' + key);
    }
    if (self._destroyed) {
        throw new Error('Cannot get() because destroyed: ' + key);
    }

    return self._configValues[key];
};

StaticConfig.prototype.set = function set(key, value) {
    var self = this;

    assert(typeof key === 'string', 'key must be a string: ' + key);
    if (key in self._configValues) {
        throw new Error('Key already exists: ' + key);
    }
    if (self._frozen) {
        throw new Error('Cannot set(' + key + ') because frozen');
    }

    self._configValues[key] = value;

    return null;
};

StaticConfig.prototype.freeze = function freeze() {
    var self = this;

    self._frozen = true;

    return null;
};

StaticConfig.prototype.destroy = function destroy() {
    var self = this;

    self._frozen = true;
    self._configValues = Object.create(null);
    self._destroyed = true;

    return null;
};

StaticConfig.prototype._initializeConfigValues =
function _initializeConfigValues() {
    var self = this;

    var objects = [];

    for (var i = 0; i < self._files.length; i++) {
        var fileObject = self._parseFile(self._files[i]);

        if (fileObject) {
            objects.push(fileObject);
        }
    }

    if (self._seedConfig) {
        objects.push(self._seedConfig);
    }

    for (var j = 0; j < objects.length; j++) {
        var configObject = objects[j];
        var keys = Object.keys(configObject);

        for (var k = 0; k < keys.length; k++) {
            self._configValues[keys[k]] = configObject[keys[k]];
        }
    }
};

StaticConfig.prototype._parseFile = function _parseFile(fileName) {
    var result = safeSyncRead();
    if (result.error) {
        return null;
    }
    var fileContents = result.fileContents;

    result = safeJSONParse(fileContents);
    if (result.error) {
        return null;
    }

    return result.json;
};

function safeSyncRead(filePath) {
    /* eslint no-try-catch: [0]*/
    var fileContents;
    var error;

    try {
        fileContents = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
        error = err;
    }

    return {
        fileContents: fileContents,
        error: error
    };
}

function safeJSONParse(text) {
    var json;
    var error;

    try {
        json = JSON.parse(text);
    } catch (err) {
        error = err;
    }

    return {
        json: json,
        error: error
    };
}
