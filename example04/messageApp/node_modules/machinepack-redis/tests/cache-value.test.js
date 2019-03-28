/**
 * Module dependencies
 */

var Pack = require('../');
var shouldProperlyStoreValue = require('./helpers/should-properly-store-value.test-helper');



/**
 * Note: These tests should ideally not be redis-specific.
 * (that way we can reuse them for any driver implementing the "cache" interface layer)
 */

describe('cacheValue()', function (){

// Used to hold manager and active connection throughout the tests below.
  var manager;
  var connection;
  // The keys to use during tests. Prefixed with `machinepack-redis.` so that 
  // there is no key name clash with any other possible existing keys
  var keysUsed = [12345, 'machinepack-redis.test1', 'machinepack-redis.test2', 'machinepack-redis.test3', 'machinepack-redis.test4', 'machinepack-redis.test5', 'machinepack-redis.test6', 'machinepack-redis.test7', 'machinepack-redis.test8'];

  //                                               _   _             
  //                                              | | (_)            
  // _ __   ___     ___ ___  _ __  _ __   ___  ___| |_ _  ___  _ __  
  //| '_ \ / _ \   / __/ _ \| '_ \| '_ \ / _ \/ __| __| |/ _ \| '_ \ 
  //| | | | (_) | | (_| (_) | | | | | | |  __/ (__| |_| | (_) | | | |
  //|_| |_|\___/   \___\___/|_| |_|_| |_|\___|\___|\__|_|\___/|_| |_|
  //                                                                 
  describe('with no connection', function (){
    it('should fail', function (done){
      Pack.cacheValue({
        connection: {},
        key: keysUsed[1],
        value: 1
      }).exec({
        error: done,
        badConnection: function (){
          return done();
        },
        success: function (){
          return done(new Error('Expecting `badConnection` exit'));
        }
      });
    });
  });


  //  ╔╗ ╔═╗╔═╗╦╔═╗  ╦ ╦╔═╗╔═╗╔═╗╔═╗
  //  ╠╩╗╠═╣╚═╗║║    ║ ║╚═╗╠═╣║ ╦║╣
  //  ╚═╝╩ ╩╚═╝╩╚═╝  ╚═╝╚═╝╩ ╩╚═╝╚═╝
  describe('with basic usage', function (){


    //  ┌┐ ┌─┐┌─┐┌─┐┬─┐┌─┐
    //  ├┴┐├┤ ├┤ │ │├┬┘├┤
    //  └─┘└─┘└  └─┘┴└─└─┘ooo
    //
    // Beforehand, create a manager and acquire an initial active
    // connection from it.
    before(function (done){
      Pack.createManager({
        connectionString: 'redis://127.0.0.1:6379',
        meta: {
          password: 'qwer1234'
        }
      }).exec({
        error: done,
        success: function (report){
          // Save reference to manager.
          manager = report.manager;
          Pack.getConnection({
            manager: manager
          }).exec({
            error: done,
            success: function (report){
              // Save reference to connection.
              connection = report.connection;
              // Now delete keys just to be safe.
              Pack.destroyCachedValues({
                connection: connection,
                keys: keysUsed
              }).exec(done);
            }
          });
        }
      });
    }); //</before>


    it('should work', function (done){
      Pack.cacheValue({
        connection: connection,
        key: keysUsed[1],
        value: [{bar: 23, baz: 'agadsg'}]
      }).exec(done);
    }); //</it should work>


    it('should properly store a string value', function (done){
      shouldProperlyStoreValue({
        connection: connection,
        key: keysUsed[2],
        valueToStore: 'hello world'
      }, done);
    }); //</should properly store a string value>


    it('should properly store an object', function (done){
      shouldProperlyStoreValue({
        connection: connection,
        key: keysUsed[3],
        valueToStore: {
          bar: 23,
          baz: 'agadsg'
        }
      }, done);
    }); //</should properly store an object>

    it('should properly store an array', function (done){
      shouldProperlyStoreValue({
        connection: connection,
        key: keysUsed[3],
        valueToStore: [
          {
            bar: 23,
            baz: 'agadsg'
          },
          10,
          'foo',
          null,
          '',
          false
        ]
      }, done);
    }); //</should properly store an array>

    it('should properly store a number', function (done){
      // (e.g. if you store `4` it shouldn't end up as `'4'` when it is retrieved)
      shouldProperlyStoreValue({
        connection: connection,
        key: keysUsed[4],
        valueToStore: 29
      }, done);
    }); //</should properly store a number>

    it('should properly store `null`', function (done){
      shouldProperlyStoreValue({
        connection: connection,
        key: keysUsed[5],
        valueToStore: null
      }, done);
    }); //</should properly store `null`>

    it('should properly store `false`', function (done){
      shouldProperlyStoreValue({
        connection: connection,
        key: keysUsed[6],
        valueToStore: false
      }, done);
    }); //</should properly store `false`>

    it('should properly store `0`', function (done){
      shouldProperlyStoreValue({
        connection: connection,
        key: keysUsed[7],
        valueToStore: 0
      }, done);
    }); //</should properly store `0`>

    it('should properly store empty string `\'\'`', function (done){
      shouldProperlyStoreValue({
        connection: connection,
        key: keysUsed[8],
        valueToStore: ''
      }, done);
    }); //</should properly store empty string `\'\'`>

    it('should properly store if the key is a number. It is converted to a key',
      function (done){
        shouldProperlyStoreValue({
          connection: connection,
          key: keysUsed[0],
          valueToStore: '12345'
        }, done);
      }); //</should properly store if the key is a number. It is converted to a key>

    it('should fail if key is an object', function (done){
      Pack.cacheValue({
        connection: connection,
        key: {},
        value: ''
      }).exec({
        error: function (err){
          done();
        },
        success: function (){
          return done(new Error('Expecting `error` exit'));
        }
      });
    }); //</should fail if key is an object>

    it('should fail if key is an array', function (done){
      Pack.cacheValue({
        connection: connection,
        key: [],
        value: ''
      }).exec({
        error: function (err){
          done();
        },
        success: function (){
          return done(new Error('Expecting `error` exit'));
        }
      });
    }); //</should fail if key is an array>


    it('should handle ttl correctly', function (done){
      this.timeout(1700);

      Pack.cacheValue({
        connection: connection,
        key: keysUsed[1],
        value: 'timedout',
        ttl: 1
      }).exec({
        error: function (err){
          return done(new Error('Expecting `success` exit'));
        },
        success: function (){
          // first check that it exists in the next 500ms
          setTimeout(function (){
            Pack.getCachedValue({
              connection: connection,
              key: keysUsed[1]
            }).exec({
              error: done,
              badConnection: function (){
                return done(new Error('Expecting `succeess` exit'));
              },
              notFound: function (){
                return done(new Error('Expecting `succeess` exit'));
              },
              success: function (value){
                // now check that it expired, after 1.5 secs
                setTimeout(function (){
                  Pack.getCachedValue({
                    connection: connection,
                    key: keysUsed[1]
                  }).exec({
                    error: done,
                    badConnection: function (){
                      return done(new Error('Expecting `notFound` exit'));
                    },
                    notFound: function (){
                      return done();
                    },
                    success: function (value){
                      return done(new Error('Expecting `notFound` exit'));
                    }
                  });
                }, 1000);
              }
            });
          }, 500);
        }
      });
    }); //</should handle ttl correctly>



    //  ┌─┐┌─┐┌┬┐┌─┐┬─┐
    //  ├─┤├┤  │ ├┤ ├┬┘
    //  ┴ ┴└   ┴ └─┘┴└─ooo
    // Afterwards, destroy the keys that were set, and then also destroy the manager
    // (which automatically releases any connections).
    after(function (done){
      Pack.destroyCachedValues({
        connection: connection,
        keys: keysUsed
      }).exec(function (err){
        // If there is an error deleting keys, log it but don't stop
        // (we need to be sure and destroy the manager)
        if (err) {
          console.error('ERROR: Could not destroy keys in test cleanup.  Details:\n', err);
        }
        Pack.destroyManager({
          manager: manager
        }).exec(done);
      });
    }); //</after>


  }); //</with basic usage>

});


