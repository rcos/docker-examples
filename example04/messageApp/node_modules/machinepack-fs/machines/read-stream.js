module.exports = {


  friendlyName: 'Read file (stream)',


  description: 'Open a readable stream that will pump out the contents from a file on disk.',


  extendedDescription: 'This machine determines whether a file actually exists, is not a directory, and can be opened at the provided source path.  '+
  'The responsibility for any other validations falls on the consumer of the stream.  However, this machine _DOES_ bind an `error` event handler on the stream '+
  'to prevent emitted error events from crashing the process; ensuring that this machine is agnostic of its userland environment.\n\n'+
  'If you plan to write code which uses the readable stream returned by this machine but you have never worked with file streams in '+
  'Node.js, [check this out](https://docs.nodejitsu.com/articles/advanced/streams/how-to-use-fs-create-read-stream) for tips.  For more '+
  'information about readable streams in Node.js in general, check out the section on [`stream.Readable`](https://nodejs.org/api/stream.html#stream_class_stream_readable) '+
  'in the Node.js docs.',


  inputs: {

    source: {
      description: 'Absolute path to the source file (if relative path is provided, will resolve path from current working directory)',
      example: '/Users/mikermcneil/.tmp/foo',
      required: true
    }

  },


  exits: {

    doesNotExist: {
      description: 'No file exists at the provided `source` path'
    },

    isDirectory: {
      description: 'A directory (not the file we were expecting) is at the source path.'
    },

    success: {
      description: 'The file exists and has been successfully opened.  The resulting stream may be read at any time.',
      extendedDescription: 'Note that, while this result stream is associated with an open file descriptor, it _is not flowing_.  '+
      'In other words, it is _paused_. That means you don\'t have to worry about using it immediately (i.e. before even one tick of the event loop elapses).',
      variableName: 'Readable stream',
      outputDescription: 'A stream of data from the source file.',
      example: '==='
    },

  },


  fn: function (inputs,exits) {
    var path = require('path');
    var fs = require('fs');

    // In case we ended up here w/ a relative path,
    // resolve it using the process's CWD
    inputs.source = path.resolve(inputs.source);

    // Set up a simple flag as a local variable (`alreadyExited`) which will serve
    // as a spinlock to ensure this machine fn does not exit more than once.
    var alreadyExited;

    // Now create the read stream.  This is synchronous, but it also doesn't tell us
    // whether or not the file at the specified source path actually exists, or whether
    // we can access that path, etc.  That's all up to the machine which consumes this
    // stream to figure out.
    var file__ = fs.createReadStream(inputs.source);

    // Bind a no-op handler for the `error` event to prevent it from crashing the process if it fires.
    // (userland code can still bind and use its own error events)
    file__.on('error', function noop (err) { });
    // ^ Since event handlers are garbage collected when the event emitter is itself gc()'d, it is safe
    // for us to bind this event handler here.


    // Also bind a one-time error handler specifically to catch a few specific errors that can
    // occur up-front.
    file__.once('error', function (err) {
      // When receiving subsequent read errors on this Readable stream after
      // the first (or after we've exited successfully), the best we can do
      // is remain silent.
      if (alreadyExited) {
        // Note that in the future, we could expose an optional input
        // (e.g. `onUnexpectedError`) which accepts a notifier function that
        // could be called in this scenario.
        return;
      }

      if (err.code === 'ENOENT') {
        alreadyExited = true;
        return exits.doesNotExist();
      }

      // If any other sort of miscellaneous error occurs... (as long as we haven't exited yet)
      alreadyExited = true;
      return exits.error(err);
    });


    // Now wait for the file to be opened...
    file__.once('open', function (fd){

      // Once the file is open, use the file descriptor (`fd`) to transactionally ensure that it is not
      // a directory using `fstat`. Why do we have to do this?  Well, even if this is a directory, it can
      // still be _OPENED_ just fine-- but the first time you try to read it... BAM. Check out @modchan's
      // SO answer at http://stackoverflow.com/a/24471971/486547 for more details & analysis.
      fs.fstat(fd, function (err, stats) {
        if (alreadyExited) {return;}

        if (err) {
          alreadyExited = true;
          return exits.error(err);
        }

        if (stats.isDirectory()) {
          alreadyExited = true;
          return exits.isDirectory();
        }

        alreadyExited = true;
        return exits.success(file__);
      }); //</fstat()>
    }); //</on open>
  }


};

