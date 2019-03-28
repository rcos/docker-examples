module.exports = {


  friendlyName: 'To lowercase',


  description: 'Convert all uppercase letters to lowercase in the specified string.',


  extendedDescription: 'Returns a version of the string with lowercase characters replaced with uppercase characters -- this is equivalent to using `toLowerCase()` in JavaScript.',


  sync: true,


  cacheable: true,


  inputs: {

    string: {
      example: 'Some stuff and THINGS 235823523',
      description: 'The string to lowercase.',
      required: true
    }

  },


  exits: {

    success: {
      example: 'some stuff and things 235823523',
    }

  },


  fn: function (inputs, exits) {
    return exits.success(inputs.string.toLowerCase());
  }


};
