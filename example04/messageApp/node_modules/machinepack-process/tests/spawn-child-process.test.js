/**
 * Module dependencies
 */

var _ = require('lodash');
var async = require('async');
var Pack = require('../');





describe('spawnChildProcess()', function (){




  describe('with basic usage', function(){
    var childProc;

    it('should work', function (done){
      var _childProc = Pack.spawnChildProcess({
        command: 'echo',
        cliArgs: ['hi there']
      }).execSync();
      childProc = _childProc;
      childProc.once('error', function whenFirstErrorIsEmitted(err){ return done(err); });
      return done();
    });

    after(function (done) {
      if (!childProc) { return done(); }

      Pack.killChildProcess({
        childProcess: childProc,
        forceIfNecessary: true
      }).exec(done);
    });
  });



  describe('multiple child processes at once', function(){

    var childProcs = [];
    it('should work even with lots of child processes at once', function (done){

      // Spin up several child processes at once, tracking them using
      // the local variable defined above (`childProcs`) so it is available
      // for us in `after` below.
      async.each(_.range(15), function (i, next) {
        var _childProc = Pack.spawnChildProcess({
          command: 'echo',
          cliArgs: ['hi #'+i]
        }).execSync();
        childProc = _childProc;
        // childProc.stdout.on('data', function onData(data){ console.log('->',data.toString()); });
        childProc.once('error', function whenFirstErrorIsEmitted(err){ return next(err); });
        return next();
      }, function afterwards(err){
        if (err) { return done(err); }
        return done();
      });
    });

    after(function (done) {
      // Now if we made it this far, kill all of the child processes
      // that we just spun up.
      async.each(childProcs, function (childProc, next){
        Pack.killChildProcess({
          childProcess: childProc,
          forceIfNecessary: true
        }).exec(next);
      }, done);
    });

  });//<multiple child processes at once>



  describe('if the child process emits an error', function (){
    this.slow(1500);

    var childProc;
    it('should not crash the process', function (done){
      childProc = Pack.spawnChildProcess({
        command: 'blah blah, space separated args arent allowed see, so this will be emitting errors for sure!!!!',
      }).execSync();
      // We wait another few moments just to be 100% sure.
      setTimeout(function (){
        return done();
      }, 250);
    });

    after(function (done) {
      if (!childProc) { return done(); }

      Pack.killChildProcess({
        childProcess: childProc,
        forceIfNecessary: true
      }).exec(done);
    });

  });//</if the child process emits an error>



  describe('when the child process exits', function (){
    this.slow(3000);

    var childProc;

    it('should not crash the process', function (done){
      var _childProc = Pack.spawnChildProcess({
        command: 'sleep',
        cliArgs: ['1']
      }).execSync();
      childProc = _childProc;
      childProc.once('error', function whenFirstErrorIsEmitted(err){ return done(err); });

      // Wait for the child process to finish.
      childProc.on('close', function (){
        return done();
      });

    });

    after(function (done) {
      if (!childProc) { return done(); }

      Pack.killChildProcess({
        childProcess: childProc,
        forceIfNecessary: true
      }).exec(done);
    });
  });//</when the child process exits>



});
