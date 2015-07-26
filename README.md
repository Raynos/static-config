# static-config

Config loader for static application configuration

## Motivation

The static configuration for your application should come from
only a few places:

 - Files checked into git
 - Configuration values passed in from the command line
 - A configuration object created in your tests for test overwrites

The first two are used in production, the last one is necessary
to sanely integrate with tests.

Here is an example of how you might configure your application

```js
// server.js
var StaticConfig = require('static-config');
var parseArgs = require('minimist');
var fs = require('fs');
var path = require('path');

var MyApplication = require('./app.js');

if (require.main === module) {
    main(parseArgs(process.argv.slice(2)));
}

function main(argv) {
    var configFolder = path.join(__dirname, 'config');
    var environment = argv.env || 'local';
    var dc = fs.statFileSync('/etc/datacenter') ?
        fs.readFileSync('/etc/datacenter') : 'no-dc';

    var config = StaticConfig({
        files: [
            path.join(configFolder, 'production.json'),
            path.join(configFolder, environment + '.json'),
            path.join(configFolder, dc + '.json'),
            path.join(configFolder, 'secrets', 'secrets.json')
        ],
        seedConfig: null
    });

    config.set('argv.port', argv.port);
    config.freeze();

    var app = MyApplication(config, {
        /* ... */
    });

    app.bootstrap();
}
```


## Installation

`npm install static-config`

## Tests

`npm test`

## Contributors

 - Raynos

## MIT Licensed

  [build-png]: https://secure.travis-ci.org/Raynos/static-config.png
  [build]: https://travis-ci.org/Raynos/static-config
  [cover-png]: https://coveralls.io/repos/Raynos/static-config/badge.png
  [cover]: https://coveralls.io/r/Raynos/static-config
  [dep-png]: https://david-dm.org/Raynos/static-config.png
  [dep]: https://david-dm.org/Raynos/static-config
  [npm-png]: https://nodei.co/npm/static-config.png?stars&downloads
  [npm]: https://nodei.co/npm/static-config
