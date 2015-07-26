'use strict';

var test = require('tape');

var StaticConfig = require('../index.js');

test('StaticConfig is a function', function t(assert) {
    assert.equal(typeof StaticConfig, 'function');
    assert.end();
});

test('can create empty config', function t(assert) {
    var config = StaticConfig({
        files: []
    });

    config.set('k', 'v');
    assert.equal(config.get('k'), 'v');

    assert.end();
});

test('can get namespaces', function t(assert) {
    var config = StaticConfig({
        files: []
    });

    config.set('a.b.c', 'v');
    assert.equal(config.get('a.b.c'), 'v');

    assert.end();
});

test('throws for non-existant keys', function t(assert) {
    var config = StaticConfig({
        files: []
    });

    assert.throws(function throwIt() {
        config.get('a.b.c');
    }, /Key not available: a.b.c/);

    assert.end();
});

test('supports seedConfig', function t(assert) {
    var config = StaticConfig({
        files: [],
        seedConfig: {
            'a.b.c': 'v'
        }
    });

    assert.equal(config.get('a.b.c'), 'v');

    assert.end();
});
