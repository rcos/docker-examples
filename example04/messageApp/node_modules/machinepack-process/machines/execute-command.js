module.exports = {


  friendlyName: 'Execute command',


  description: 'Execute a command like you would on the terminal.',


  extendedDescription:
  'This uses the `child_process.exec()` method from Node.js core to run the specified command. '+
  'The success exit from this machine will not be called until the command has finished running (i.e. the resulting child process exits). '+
  'If you need a more advanced/flexible interface, check out `spawnChildProcess()`.  It is much lower-level, and exposes raw access to the '+
  'child process instance.',


  moreInfoUrl: 'https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback',


  inputs: {

    command: {
      friendlyName: 'Command',
      description: 'The command to run, including any whitespace-delimited CLI args/opts.',
      example: 'ls -la',
      required: true
    },

    dir: {
      friendlyName: 'Run from...',
      description: 'The path to the directory where this command will be run.',
      extendedDescription: 'If not set, this defaults to the present working directory.  If a relative path is provided, it will be resolved relative to the present working directory.',
      example: '/Users/mikermcneil/foo'
    },

    environmentVars: {
      friendlyName: 'Environment variables',
      description: 'A dictionary of environment variables to provide to the child process.',
      extendedDescription: 'By default, the same environment variables as in the current process will be used.  If specified, the dictionary should consist of the name of each environment variable as a key, and the value of the variable on the right-hand side.  The value of any environment variable is always a string.',
      example: {}
    },

    timeout: {
      friendlyName: 'Timeout',
      description: 'The maximum number of miliseconds to wait for this command to finish.',
      extendedDescription: 'By default, no time limit will be enforced.  Note that if the time limit is reached, SIGERM will be sent to the child process.',
      example: 60000
    }

  },


  exits: {

    notADir: {
      friendlyName: 'not a directory',
      description: 'The specified path points to a something which is not a directory (e.g. a file or shortcut).'
    },

    forbidden: {
      friendlyName: 'forbidden',
      description: 'Insufficient permissions to spawn process from the specified path (i.e. you might need to use `chown`/`chmod`)'
    },

    noSuchDir: {
      friendlyName: 'no such directory',
      description: 'Cannot run process from the specified path because no such directory exists.'
    },

    timedOut: {
      friendlyName: 'Timed out',
      description: 'The specified command was automatically killed because it had not finished before the configured time limit (`timeout`).',
      extendedDescription: 'Note that the command _may have already caused side effects_ before it was stopped.'
    },

    success: {
      variableName: 'bufferedOutput',
      outputDescription: 'The output returned from executing the command.',
      extendedDescription: 'Note that the output is split into that which came from "stdout" vs. that which came from "stderr". ',
      example: {
        stdout: '...',
        stderr: '...'
      },
    },

  },


  fn: function (inputs,exits) {
    var path = require('path');
    var executeCmdInChildProc = require('child_process').exec;
    var isObject = require('lodash.isobject');
    var isUndefined = require('lodash.isundefined');

    // First, build up the options to pass in to `child_process.exec()`.
    var childProcOpts = {};

    // Determine the appropriate `cwd` for `child_process.exec()`.
    if (isUndefined(inputs.dir)) {
      // Default directory to current working directory
      childProcOpts.cwd = process.cwd();
    }
    else {
      // (or if a `dir` was specified, resolve it to make sure
      //  it's an absolute path.)
      childProcOpts.cwd = path.resolve(inputs.dir);
    }

    // If `timeout` was provided, pass it in to `child_process.exec()`.
    // Note that we also track a timestamp (epoch ms) for use in negotiating errors below.
    var timestampBeforeExecutingCmd;
    if (!isUndefined(inputs.timeout)) {
      if (inputs.timeout < 1) {
        return exits.error('Invalid timeout (`'+inputs.timeout+'`).  Must be greater than zero.  Remember: `timeout` should be used to indicate the maximum number of miliseconds to wait for this command to finish before giving up.');
      }
      childProcOpts.timeout = inputs.timeout;
      timestampBeforeExecutingCmd = (new Date()).getTime();
    }

    // If `environmentVars` were provided, pass them in to `child_process.exec()`.
    if (!isUndefined(inputs.environmentVars)) {
      childProcOpts.env = inputs.environmentVars;
    }



    // Now spawn the child process.
    var liveChildProc = executeCmdInChildProc(inputs.command, childProcOpts, function onClose(err, bufferedStdout, bufferedStderr) {
      if (err) {
        if (!isObject(err)) {
          return exits.error(err);
        }
        // console.log('err=>',err);
        // console.log('keys=>',Object.keys(err));
        // console.log('err.code=>',err.code);
        // console.log('err.killed=>',err.killed);
        // console.log('err.syscall=>',err.syscall);
        // console.log('err.errno=>',err.errno); // e.g. 127 || 'ENOENT'
        // console.log('err.signal=>',err.signal); // e.g. 'SIGTERM'

        // `err.syscall.match(/spawn/i)` should be true as well, but not testing since
        // Node v0.12 changed this a bit and we want to future-proof ourselves if possible.
        if (err.code==='ENOTDIR') {
          return exits.notADir();
        }
        if (err.code==='ENOENT') {
          return exits.noSuchDir();
        }
        if (err.code==='EACCES') {
          return exits.forbidden();
        }

        // Check to see if this error is because of the configured timeout.
        if (err.signal==='SIGTERM' && inputs.timeout) {
          var msElapsed = (new Date()).getTime() - timestampBeforeExecutingCmd;
          if (msElapsed >= inputs.timeout) {
            return exits.timedOut();
          }
        }
        return exits.error(err);
      }

      // console.log('Child process exited with exit code ' + code);
      return exits.success({
        stdout: bufferedStdout,
        stderr: bufferedStderr
      });
    });
  },



};
