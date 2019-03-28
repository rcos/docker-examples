/**
 * Module dependencies
 */

var path = require('path');
var ChildProcess = require('child_process');
var _ = require('@sailshq/lodash');
var sanitizeGruntOutputChunk = require('./sanitize-grunt-output-chunk');
var logGruntAbortedError = require('./log-grunt-aborted-error');



/**
 * `helpRunTask()`
 *
 * Fork a Grunt child process that runs the specified task.
 * > Private utility function that powers `sails.hooks.grunt.runTask()`.
 *
 *
 * @param {SailsApp} sails
 *        The Sails app instance.
 *
 * @param {String} taskName
 *        The name of the Grunt task to run.
 *
 * @param {Function} cueAfterTaskStarted
 *        Optional.  Fires when the Grunt task has been started (non-production) or exits successfully (in production).
 *        Note that the `grunt:hook:error` and `grunt:hook:done` events are fired regardless of whether
 *        a callback is provided or not. Also note that this callback is not precisely equivalent to the semantic
 *        of these two events (for backwards compatibility).
 *        (Note: This is a "consequence procedure" --
 *          see https://gist.github.com/mikermcneil/1efd95bdcedecbd064f9d0d0ba725b13)
 *
 * @api private
 *      (however note that this is called ALMOST directly by `sails www` in the CLI)
 */
module.exports = function helpRunTask(sails, taskName, cueAfterTaskStarted) {

  // Determine the path to the root directory of the current running instance
  // of Sails core.
  var pathToSails = path.resolve(__dirname, '../../../');

  // If provided task is not a string, fail silently.
  // FUTURE: handle this more elegantly-- leaving this in as-is to ensure backwards compatiblity,
  // but it should be replaced in a subsequent release with an error instead (b/c )
  if (!taskName) {
    taskName = '';
  }

  // Fork Grunt child process
  var child = ChildProcess.fork(

    // Set our Grunt wrapper file in Sails core as the working directory for
    // the Grunt child process.
    path.join(__dirname, 'grunt-wrapper.js'),

    // Command-line arguments (e.g. `foo bar`) and command-line options (e.g. `--foo="bar"`)
    // to pass to the child process.
    [
      taskName,
      '--pathToSails=' + pathToSails,

      // Backwards compatibility for v0.9.x
      '--gdsrc=' + pathToSails + '/node_modules'
    ],

    // Command-line options (e.g. `--foo="bar"`) to pass to the child process.
    {
      silent: true,
      stdio: 'pipe',
      // Pass all current node process arguments to the child process,
      // except the debug-related arguments, see issue #2670
      execArgv: process.execArgv.slice(0).filter(function(param) {
        return !(new RegExp('--(debug|inspect)(-brk=[0-9]+)?').test(param));
      })
    }
  );


  // Initialize local variables which will be used to buffer the
  // incoming output from our Grunt child process.
  //
  // `errorMsg` will end up holding the human-readable error message,
  // while `stackTrace` will end up with our best guess at a reasonable
  // stack trace parsed from the incoming child proc output.
  var errorMsg = '';
  var stackTrace = '';


  // Receive output as it comes in from the child proc's stdout
  // (e.g. when Grunt does `console.log()`)
  child.stdout.on('data', function(consoleMsg) {

    // store all the output
    consoleMsg = consoleMsg.toString();
    errorMsg += consoleMsg;

    // Clean out all the whitespace
    var trimmedStackTrace = (typeof stackTrace === 'string') ? stackTrace : '';
    trimmedStackTrace = trimmedStackTrace.replace(/[\n\s]*$/, '');
    trimmedStackTrace = trimmedStackTrace.replace(/^[\n\s]*/, '');
    var trimmedConsoleMsg = (typeof consoleMsg === 'string') ? consoleMsg : '';
    trimmedConsoleMsg = trimmedConsoleMsg.replace(/[\n\s]*$/, '');
    trimmedConsoleMsg = trimmedConsoleMsg.replace(/^[\n\s]*/, '');

    // Remove '--force to continue' message since it makes no sense
    // in this context:
    trimmedConsoleMsg = trimmedConsoleMsg.replace(/Use --force to continue\./i, '');
    trimmedStackTrace = trimmedStackTrace.replace(/Use --force to continue\./i, '');

    // Find the stack trace related to this warning
    stackTrace = errorMsg.substring(errorMsg.lastIndexOf('Running "'));

    // Handle fatal errors, like missing grunt dependency, etc.
    if (consoleMsg.match(/Fatal error/g)) {

      // If no Gruntfile exists, don't crash- just display a warning.
      if (consoleMsg.match(/Unable to find Gruntfile/i)) {
        sails.log.info('Gruntfile could not be found.');
        sails.log.info('(no grunt tasks will be run.)');

        // In production, we consider this the end and trigger the callback if provided.
        // (otherwise, we've already triggered the callback at this point, when the task started)
        if (sails.config.environment === 'production') {
          if (_.isFunction(cueAfterTaskStarted)) {  return cueAfterTaskStarted();  }
          else { sails.log.silly('`runTask()` could not find a Gruntfile.'); }
        }
        return;
      } // </console message contains "Unable to find Gruntfile">

      // Otherwise this is some other kind of fatal error, so log it as a "Grunt aborted" error.
      else {
        logGruntAbortedError(trimmedConsoleMsg, trimmedStackTrace, sails);
        return;
      }

    } // </console message contains "Fatal error">

    // Handle fatal Grunt errors by killing Sails process as well:
    ////////////////////////////////////////////////////////////////////
    //
    // "Aborted due to warnings"
    else if (consoleMsg.match(/Aborted due to warnings/)) {
      sails.log.error('** Grunt :: An error occurred. **');
      // sails.log.warn(trimmedStackTrace);
      // sails.emit('hook:grunt:error', trimmedStackTrace);
      logGruntAbortedError(trimmedConsoleMsg, trimmedStackTrace, sails);
      return;
    } // </console message contains "Aborted due to warnings">

    // "Warning: EMFILE"
    else if (consoleMsg.match(/EMFILE/ig)){
      sails.log.error('** Grunt :: An EMFILE error occurred. **');
      sails.log.error(
        'Usually this means there are too many files open as per your system settings.\n'+
        'If you are developing on one of the many unix-based operating systems that has\n'+
        'the `ulimit` command, then you might try running: `ulimit -n 1024`.  For more tips,\n'+
        'see https://github.com/balderdashy/sails/issues/3523#issuecomment-175922746.\n'+
        '(command[⌘]+double-click to open links in the terminal)'
      );
      logGruntAbortedError(trimmedConsoleMsg, trimmedStackTrace, sails);
      return;
    } // </console message contains "Warning: EMFILE">

    // "Warning: watch ……… ENOSPC"
    // > See https://stackoverflow.com/questions/16748737/grunt-watch-error-waiting-fatal-error-watch-enospc)
    else if (consoleMsg.match(/Warning\:\ watch\ .+\ ENOSPC/ig)){
      sails.log.error('** Grunt :: An ENOSPC error occurred. **');
      sails.log.error(
        'Usually this means there are too many files open as per your system settings.\n'+
        'If you are developing on an operating system that has the `inotify` command,\n'+
        'then you might try using it.  For more informaiton,\n'+
        'see https://github.com/balderdashy/sails/issues/3523#issuecomment-175922746.\n'
      );
      logGruntAbortedError(trimmedConsoleMsg, trimmedStackTrace, sails);
      return;
    } // </console message contains "Warning: ENOSPC">

    // "ParseError"
    else if (consoleMsg.match(/ParseError/)) {
      sails.log.warn('** Grunt :: Parse Warning **');
      sails.log.warn(trimmedStackTrace);
    } // </console message contains "ParseError">

    // Only display console message if it has content besides whitespace
    //////////////////////////////////////////////////////////////////
    else if (!consoleMsg.match(/^\s*$/)) {
      sails.log.silly('Grunt :: ' + trimmedConsoleMsg);
    } // </console message has content which is not whitespace>

  }); // </ stdout.on('data') >


  // Handle errors on the stdout stream
  // (rare- this is mainly to prevent throwing and crashing the process)
  child.stdout.on('error', function(gruntOutput) {
    sails.log.error('Grunt ::', sanitizeGruntOutputChunk(gruntOutput));
  }); //</on stdout error>

  // Receive output from the proc's stderr stream.
  // (e.g. when Grunt does `console.error()`)
  child.stderr.on('data', function(gruntOutput) {
    gruntOutput = sanitizeGruntOutputChunk(gruntOutput);
    // Ignore the "debugger listening" message from node --debug
    if (gruntOutput.match(/debugger listening on port/)) {
      return;
    }
    // Any other stderr output gets logged using `sails.log.error`.
    else {
      sails.log.error('Grunt ::', gruntOutput);
    }
  }); //</on stderr data>

  // Handle errors on the stderr stream.
  // (rare- this is mainly to prevent throwing and crashing the process)
  child.stderr.on('error', function(gruntOutput) {
    sails.log.error('Grunt ::', sanitizeGruntOutputChunk(gruntOutput));
  }); //</on stderr error>


  // When Grunt child process exits, fire event on `sails` app object.
  child.on('exit', function(code) {

    // If this is a non-zero status code, emit the 'hook:grunt:error' event.
    if (code !== 0) {
      // (in production, the callback is called in the appropriate spots above, so
      //  it does not need to be triggered again here)
      // --FUTURE: make this implementation simpler!  It'll be a breaking change.--
      return sails.emit('hook:grunt:error');
    }

    // Otherwise emit 'hook:grunt:done'
    sails.emit('hook:grunt:done');

    // Note that, if we're in a production environment, we wait until the Grunt
    // child process actually exits (Grunt task finishes running) before firing
    // the callback passed in to `runTask`.
    // (if this is not production, then we already fired the callback when the
    //  task was first run)
    if (sails.config.environment === 'production') {
      if (_.isFunction(cueAfterTaskStarted)) { return cueAfterTaskStarted(); }
      else { sails.log.silly('`runTask()` has finished the Grunt task.'); }
    }
  }); //</when child process exits>

  // Since there could be long-running tasks like `grunt-contrib-watch` involved,
  // we'll want the ability to flush our child process later.
  // So we save a reference to it on `sails.childProcesses`.
  sails.log.silly('Tracking new grunt child process...');
  if (!_.isArray(sails.childProcesses)) {
    var consistencyViolationErr = new Error(
    'Consistency violation: `sails.childProcesses` should exist and be an array.  ' +
    'Instead it\'s type: `' + typeof sails.childProcesses + '` '+
    'This means that either a custom hook or app code has damaged the `sails.childProcesses` array, '+
    'or there is a bug in Sails core.  If you expect the latter, please file an issue in the GitHub repo.'
    );
    if (_.isFunction(cueAfterTaskStarted)) {  return cueAfterTaskStarted(consistencyViolationErr);  }
    else { sails.log.error(consistencyViolationErr); }
  }
  sails.childProcesses.push(child);


  // Now that the child process is chugging along, if we are NOT in a production
  // environment, we'll go ahead and fire our callback (since Grunt might just be sitting
  // here backgrounded, assuming the conventional default pipeline is being used with
  // grunt-contrib-watch.)
  //
  // Note that, if we were in a production environment, we'd wait until the Grunt
  // child proc actually finished running before firing our callback.  But we go ahead
  // and fire it here.
  if (sails.config.environment !== 'production') {
    if (_.isFunction(cueAfterTaskStarted)) {  return cueAfterTaskStarted();  }
    else { sails.log.silly('`runTask()` has started the Grunt task.'); }
  }
};//</function definition :: sails.hooks.grunt.runTask()>
