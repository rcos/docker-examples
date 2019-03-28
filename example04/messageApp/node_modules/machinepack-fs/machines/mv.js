module.exports = {


  friendlyName: 'Move (mv)',


  description: 'Move file or directory located at source path to the destination path.',


  inputs: {

    source: {
      example: '/Users/mikermcneil/.tmp/foo',
      required: true
    },

    destination: {
      example: '/Users/mikermcneil/.tmp/bar',
      required: true
    }

  },


  exits: {

    success: {
      description: 'Contents at source path were moved successfully to the destination.'
    },

    doesNotExist: {
      description: 'No file or folder exists at the provided souce path.'
    }

  },


  fn: function(inputs, exits) {
    var path = require('path');
    var fsx = require('fs-extra');

    // Ensure absolute paths.
    inputs.source = path.resolve(inputs.source);
    inputs.destination = path.resolve(inputs.destination);

    fsx.move(inputs.source, inputs.destination, function (err) {
      if (err) {
        if (err.code === 'ENOENT') {
          return exits.doesNotExist();
        }
        return exits.error(err);
      }
      return exits.success();
    });
  },

};
