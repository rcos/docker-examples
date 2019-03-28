module.exports = {


  friendlyName: 'Deburr a string',


  description: 'Replace special alphabetical characters such as umlauts and accents with their basic, boring equivalents.',


  extendedDescription: 'Technically, this converts "latin-1 supplementary characters" to basic letters and removes combining diacritical marks.',


  sync: true,


  cacheable: true,


  inputs: {

    string: {
      friendlyName: 'String',
      description: 'The string to clean up.',
      example: 'déjà vu, Günther. Just more of your saß.',
      required: true
    }

  },


  exits: {

    success: {
      example: 'deja vu, Gunther. Just more of your sass.',
    }

  },


  fn: function (inputs, exits) {
    var _ = require('lodash');
    return exits.success(_.deburr(inputs.string));
  }

};
