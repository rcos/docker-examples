module.exports = {


  friendlyName: 'Write JSON file',


  description: 'Write some data to the specified destination path on disk.',


  extendedDescription: 'Assumes file is encoded using utf8.',


  idempotent: true,


  inputs: {

    json: {
      example: '*',
      description: 'The data to write to disk as JSON',
      required: true
    },

    destination: {
      example: '/Users/mikermcneil/.tmp/bar.json',
      description: 'Absolute path for the destination file (if relative path is provided, will resolve path from current working directory)',
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
      description: 'JSON file written successfully.'
    },

    alreadyExists: {
      description: 'A file or folder already exists at the specified destination'
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

        // Now write the JSON file to disk.
        fsx.outputJson(inputs.destination, inputs.json, exits);

      });//</after deleting existing file(s)/dir(s) if necessary>
    });//</fsx.exists()>
  }


};
