module.exports = {


  friendlyName: 'Join',


  description: 'Combine an array of strings into one new string.',


  sync: true,


  cacheable: true,


  inputs: {

    strings: {
      description: 'The array of strings to join.',
      example: ['foo'],
      required: true
    },

    separator: {
      description: 'The optional separator to insert between each string.',
      defaultsTo: '',
      example: ','
    }

  },


  exits: {

    success: {
      outputDescription: 'The concatenated result string.',
      example: 'foo'
    }

  },


  fn: function(inputs, exits) {
    var result = inputs.strings.join(inputs.separator||'');
    return exits.success(result);
  },

};
