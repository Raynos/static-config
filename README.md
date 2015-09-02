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
    var dc = fs.existsSync('/etc/datacenter') ?
        fs.readFileSync('/etc/datacenter') : 'no-dc';

    var config = StaticConfig({
        files: [
            path.join(configFolder, 'production.json'),
            path.join(configFolder, environment + '.json'),
            path.join(configFolder, environment + '-' + dc + '.json'),
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

## Config documentation

`StaticConfig` takes two options, `options.files` and
`options.seedConfig`.

The `options.files` is required and must be a list of file paths.
The `options.seedConfig` is optional and will be used to overwrite
configuration key value pairs if present.

The `options.files` must be a list of JSON files. Each file must
be a flat object of key, value pairs. It's recommended that you 
use keys like:

```json
{
    "name": "my-name",
    "clients.thingy": {
      "some client": "config"
    },
    "server.my-port": 9999
}
```

To organize your configuration file.

### `config.get(key)`

The `get()` call will either return the value for the `key`
or throw a key does not exist exception.

It first reads from the JSON files to see if the key exists. if
the key exists in multiple files then the last file in the array
wins.

If the key exists in `seedConfig` then it will favor `seedConfig`
over the JSON files.

If someone has manually `set()` the `key` then it will always
favor that value over `files` and over `seedConfig`.

### `config.set(key, value)`

You can take configuration from external sources, for example
from command line arguments and store them in static config.

Any keys take from external sources must not exist in the JSON
files.

`set()` will throw an exception if the key exists

### `config.inspect()`

`inspect()` returns the entire config object. This should not
be mutated and should only be used for inspection or debugging

### `config.freeze()`

Once you freeze the config any further calls to `config.set()`
will throw.

This allows you to make the static config immutable

### `config.destroy()`

Once the config is destroyed any further calls to `config.get()`
will throw.

This allows you to terminate the configuration phase and gives
you confidence that your application is now officially bootstrapped.


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
