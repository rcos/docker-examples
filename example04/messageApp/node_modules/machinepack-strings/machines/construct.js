module.exports = {


  friendlyName: 'Construct string',


  description: 'Cast the specified value to a string, if it isn\'t one already.',


  extendedDescription: 'Behind the scenes, this uses RTTC data type coercion. For example, 5 is converted to "5".',


  sync: true,


  cacheable: true,


  inputs: {

    value: {
      description: 'The value to convert',
      example: '===',
      readOnly: true,
      required: true
    }

  },


  exits: {

    success: {
      outputFriendlyName: 'String',
      outputDescription: 'A string constructed from the provided value.',
      example: 'some string'
    }

  },


  fn: function(inputs, exits) {
    return exits.success(inputs.value);
  }


};
