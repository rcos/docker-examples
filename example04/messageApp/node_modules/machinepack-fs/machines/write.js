module.exports = {


  friendlyName: 'Write file',


  description: 'Generate a file on the local filesystem using the specified utf8 string as its contents.',


  idempotent: true,


  inputs: {

    string: {
      description: 'Text to write to the file (if omitted, will create an empty file)',
      example: 'lots of words, utf8 things you know',
      defaultsTo: ''
    },

    destination: {
      description: 'Path (relative or absolute) to the file to write.',
      example: '/Users/mikermcneil/.tmp/bar',
      required: true
    },

    force: {
      description: 'Overwrite files or directories which might exist at or within the specified destination path?',
      example: false,
      defaultsTo: false
    }

  },


  exits: {

    success: {
      description: 'File written successfully.'
    },

    alreadyExists: {
      description: 'Something already exists at the specified path (overwrite by enabling the `force` input)'
    },

  },


  fn: function (inputs, exits) {
    var path = require('path');
    var fsx = require('fs-extra');


    // In case we ended up here w/ a relative path,
    // resolve it using the process's CWD
    inputs.destination = path.resolve(inputs.destination);

    // Only override an existing file if `inputs.force` is true
    fsx.exists(inputs.destination, function(exists) {
      if (exists && !inputs.force) {
        return exits.alreadyExists();
      }

      // Delete existing files and/or directories if necessary.
      (function _deleteExistingFilesAndOrDirsIfNecessary(next) {
        if (!exists) {
          return next();
        }
        else {
          fsx.remove(inputs.destination, next);
        }
      })(function nowWriteFileToDisk(err){
        if (err) { return exits(err); }

        // Now write the file to disk.
        fsx.outputFile(inputs.destination, inputs.string, exits);

      });//</after deleting existing file(s)/dir(s) if necessary>
    });//</fsx.exists()>
  }


};
