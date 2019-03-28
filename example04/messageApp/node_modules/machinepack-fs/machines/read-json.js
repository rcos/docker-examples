module.exports = {


  friendlyName: 'Read JSON file',


  description: 'Read and parse JSON file located at source path on disk into usable data.',


  extendedDescription: 'Assumes file is encoded using utf8.',


  cacheable: true,


  inputs: {

    source: {
      description: 'Absolute path to the source file (if relative path is provided, will resolve path from current working directory)',
      example: '/Users/mikermcneil/.tmp/foo.json',
      required: true
    },

    schema: {
      description: 'An example schema (in RTTC exemplar syntax) describing what the parsed data should look like (used for type-coercion)',
      extendedDescription: 'If file does not exist, a "base value" will be derived from this example schema and used as the contents of the newly created JSON file.',
      moreInfoUrl: 'https://github.com/node-machine/rttc#types--terminology',
      example: '*',
      defaultsTo: '*',
      constant: true,
      isExemplar: true
    }

  },


  exits: {

    doesNotExist: {
      description: 'No file exists at the provided `source` path'
    },

    couldNotParse: {
      description: 'Could not parse file as JSON.'
    },

    // TODO: not a file (and return what it ACTUALLY is, e.g. dir or symlink)

    success: {
      description: 'Returns parsed JSON data from the source file.',
      getExample: function (inputs){
        return inputs.schema;
      }
    }

  },


  fn: function (inputs, exits) {

    var MPJSON = require('machinepack-json');
    var thisPack = require('../');

    thisPack.read({
      source: inputs.source
    }).exec({
      error: exits.error,
      doesNotExist: exits.doesNotExist,
      success: function (contents){
        MPJSON.parse({
          json: contents,
          schema: inputs.schema
        }).exec({
          error: exits.error,
          couldNotParse: exits.couldNotParse,
          success: function (parsedData){
            return exits.success(parsedData);
          }
        });
      }
    });
  }


};
