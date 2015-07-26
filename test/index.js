'use strict';

var test = require('tape');

var staticConfig = require('../index.js');

test('staticConfig is a function', function t(assert) {
    assert.equal(typeof staticConfig, 'function');
    assert.end();
});
