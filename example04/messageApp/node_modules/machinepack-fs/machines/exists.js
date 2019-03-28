module.exports = {


  friendlyName: 'Exists?',


  description: 'Check whether a file or directory exists at the given path.',


  cacheable: true,


  inputs: {

    path: {
      example: '/Users/mikermcneil/.tmp/foo',
      description: 'The absolute path to the file or directory',
      required: true
    }

  },


  exits: {

    doesNotExist: {
      description: 'The specified path is empty'
    },

    success: {
      description: 'A file or directory exists at the specified path'
    }

  },

  fn: function (inputs, exits) {

    var Path = require('path');
    var fsx = require('fs-extra');

    fsx.exists(Path.resolve(process.cwd(),inputs.path), function(exists) {
      if (!exists) {return exits.doesNotExist();}
      return exits.success();
    });
  }


};


