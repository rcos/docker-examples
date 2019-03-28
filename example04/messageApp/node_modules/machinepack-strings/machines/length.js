module.exports = {


  friendlyName: 'Length',


  description: 'Determine the length of a string (i.e. count the number of characters)',


  sync: true,


  cacheable: true,


  inputs: {

    string: {
      example: 'guido villeriño',
      description: 'The string whose characters will be counted.',
      required: true
    }

  },


  exits: {

    success: {
      example: 15,
    }

  },


  fn: function (inputs, exits) {
    return exits.success(inputs.string.length);
  }

};
