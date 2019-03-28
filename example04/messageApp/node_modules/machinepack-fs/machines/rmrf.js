module.exports = {


  friendlyName: 'Remove (rm)',


  description: 'Completely remove a file or directory (like rm -rf).',


  extendedDescription: 'If the provided path is a directory, all contents will be removed recursively. If nothing exists at the provided path, the success exit will be triggered, but nothing will be deleted.',


  idempotent: true,


  inputs: {

    path: {
      example: '/Users/mikermcneil/.tmp/foo',
      description: 'The absolute path to the file or directory to remove.',
      required: true
    }

  },


  exits: {

    success: {
      description: 'The specified file or directory was removed.'
    }

  },

  fn: function (inputs, exits) {
    var path = require('path');
    var fsx = require('fs-extra');

    // Ensure absolute path.
    inputs.path = path.resolve(inputs.path);

    fsx.remove(inputs.path, function(err) {
      if (err) {return exits.error(err);}
      return exits.success();
    });
  }
};


