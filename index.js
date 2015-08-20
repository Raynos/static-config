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

    if (self._destroyed) {
        throw new Error('Cannot get(' + key + ') because destroyed');
    }
    if (!(key in self._configValues)) {
        throw new Error('Key not available: ' + key);
    }

    return self._configValues[key];
};

StaticConfig.prototype.set = function set(key, value) {
    var self = this;

    assert(typeof key === 'string', 'key must be a string: ' + key);
    if (self._frozen) {
        throw new Error('Cannot set(' + key + ') because frozen');
    }
    if (key in self._configValues) {
        throw new Error('Key already exists: ' + key);
    }

    self._configValues[key] = value;

    return null;
};

StaticConfig.prototype.freeze = function freeze() {
    var self = this;

    self._frozen = true;

    return null;
};

StaticConfig.prototype.inspect = function inspect() {
    var self = this;
    var clone = {};

    var keys = Object.keys(self._configValues);
    for (var i = 0; i < keys.length; i++) {
        clone[keys[i]] = self._configValues[keys[i]];
    }

    return clone;
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
    var result = safeSyncRead(fileName);
    if (result.error) {
        return null;
    }
    var fileContents = result.fileContents;

    return JSON.parse(fileContents);
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
