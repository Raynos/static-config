'use strict';

var test = require('tape');

var StaticConfig = require('../index.js');

test('StaticConfig is a function', function t(assert) {
    assert.equal(typeof StaticConfig, 'function');
    assert.end();
});
