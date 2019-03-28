module.exports = {


  friendlyName: 'Inspect',


  description: 'Pretty-print any value into a more-readable string.',


  sync: true,


  cacheable: true,


  inputs: {

    value: {
      friendlyName: 'Value',
      example: '===',
      description: 'The value that will be formatted into a more-readable string.'
    }

  },


  exits: {

    success: {
      outputFriendlyName: 'prettified',
      example: '...[{\'foo\': [\'bar\']}]...'
    }

  },


  fn: function(inputs, exits) {
    var util = require('util');
    var isError = require('lodash.iserror');
    var isObject = require('lodash.isobject');

    if (isError(inputs.value)) {
      return exits.success(util.inspect(inputs.value.stack));
    }
    if (isObject(inputs.value)) {
      return exits.success(util.inspect(inputs.value, {depth: null}));
    }
    return exits.success(util.inspect(inputs.value));
  }

};
