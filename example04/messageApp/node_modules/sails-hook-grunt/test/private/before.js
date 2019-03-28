// Inject global `before` for our Mocha tests.
before(function(done){
  try {

    // Expose some globals, for convenience.
    if (global.assert) { throw new Error('Test runner cannot expose `assert` -- that global already exists!'); }
    if (global.util) { throw new Error('Test runner cannot expose `util` -- that global already exists!'); }
    if (global._) { throw new Error('Test runner cannot expose `_` -- that global already exists!'); }
    global.assert = require('assert');
    global.util = require('util');
    global._ = require('@sailshq/lodash');

  } catch (err) { return done(err); }

  return done();
});
