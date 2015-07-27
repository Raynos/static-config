'use strict';

var test = require('tape');
var FixturesFs = require('fixtures-fs');
var path = require('path');

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

test('cannot set() existing keys', function t(assert) {
    var config = StaticConfig({
        files: [],
        seedConfig: {
            'a.b.c': 'v'
        }
    });

    assert.throws(function throwIt() {
        config.set('a.b.c', 'x');
    }, /Key already exists: a.b.c/);

    assert.end();
});

test('cannot get() from destroyed config', function t(assert) {
    var config = StaticConfig({
        files: [],
        seedConfig: {
            'a.b.c': 'v'
        }
    });

    assert.equal(config.get('a.b.c'), 'v');

    config.destroy();

    assert.throws(function throwIt() {
        config.get('a.b.c');
    }, /Cannot get\(a.b.c\) because destroyed/);

    assert.end();
});

test('cannot set() on frozen config', function t(assert) {
    var config = StaticConfig({
        files: []
    });

    config.set('a', 'a');
    config.set('b', 'b');

    config.freeze();

    assert.throws(function throwIt() {
        config.set('c', 'c');
    }, /Cannot set\(c\) because frozen/);

    assert.deepEqual(config.inspect(), {
        'a': 'a',
        'b': 'b'
    });

    assert.end();
});

test('can read from file', FixturesFs(__dirname, {
    'config': {
        'production.json': JSON.stringify({
            'a': 'b',
            'a.b.c': 'v'
        })
    }
}, function t(assert) {
    var config = StaticConfig({
        files: [
            path.join(__dirname, 'config', 'production.json')
        ]
    });

    assert.equal(config.get('a'), 'b');
    assert.equal(config.get('a.b.c'), 'v');

    assert.end();
}));

test('seedConfig overwrites files', FixturesFs(__dirname, {
    'config': {
        'production.json': JSON.stringify({
            'a': 'b',
            'a.b.c': 'v'
        })
    }
}, function t(assert) {
    var config = StaticConfig({
        files: [
            path.join(__dirname, 'config', 'production.json')
        ],
        seedConfig: {
            'a': 'c'
        }
    });

    assert.equal(config.get('a'), 'c');
    assert.equal(config.get('a.b.c'), 'v');

    assert.end();
}));

test('later files overwrite earlier files', FixturesFs(__dirname, {
    'config': {
        'production.json': JSON.stringify({
            'a': 'b',
            'a.b.c': 'v'
        }),
        'local.json': JSON.stringify({
            'a': 'c'
        })
    }
}, function t(assert) {
    var config = StaticConfig({
        files: [
            path.join(__dirname, 'config', 'production.json'),
            path.join(__dirname, 'config', 'local.json')
        ]
    });

    assert.equal(config.get('a'), 'c');
    assert.equal(config.get('a.b.c'), 'v');

    assert.end();
}));

test('is resilient to non-existant files', function t(assert) {
    var config = StaticConfig({
        files: [
            path.join(__dirname, 'config', 'production.json'),
            path.join(__dirname, 'config', 'local.json')
        ],
        seedConfig: {
            'a': 'd',
            'a.b.c': 'v2'
        }
    });

    assert.equal(config.get('a'), 'd');
    assert.equal(config.get('a.b.c'), 'v2');

    assert.end();
});

test('is resilient to invalid json', FixturesFs(__dirname, {
    'config': {
        'production.json': JSON.stringify({
            'a': 'b',
            'a.b.c': 'v'
        }),
        'local.json': '{...}'
    }
}, function t(assert) {
    var config = StaticConfig({
        files: [
            path.join(__dirname, 'config', 'production.json'),
            path.join(__dirname, 'config', 'local.json')
        ]
    });

    assert.equal(config.get('a'), 'b');
    assert.equal(config.get('a.b.c'), 'v');

    assert.end();
}));
