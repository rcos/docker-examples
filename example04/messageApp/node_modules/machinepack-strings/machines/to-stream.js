module.exports = {


  friendlyName: 'To stream',


  description: 'Convert a string into a readable stream of data.',


  extendedDescription: 'The stream that is returned is a modern (streams2) Node Readable instance. In other words it is _paused_ until it is used.',


  moreInfoUrl: 'http://stackoverflow.com/a/22085851/486547',


  sync: true,


  inputs: {

    string: {
      friendlyName: 'String',
      example: 'foo bar baz',
      description: 'The string to convert.',
      required: true
    }

  },


  exits: {

    success: {
      outputFriendlyName: 'Stream',
      outputDescription: 'A Readable stream representing a string.',
      extendedDescription:
      'Note that this result stream is _not flowing_.  In other words, it is _paused_, which means '+
      'you don\'t have to worry about using it immediately (i.e. don\'t worry about a tick of the event loop elapsing). '+
      'Also keep in mind that the stream returned is a modern (streams2) Node Readable instance.',
      example: '==='
    },

  },


  fn: function (inputs,exits) {
    var string__ = new require('stream').Readable();
    string__._read = function () {};
    string__.push(inputs.string);
    string__.push(null);
    return exits.success(string__);
  },


};
