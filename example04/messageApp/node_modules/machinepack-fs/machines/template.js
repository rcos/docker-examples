module.exports = {


  friendlyName: 'Template',


  description: 'Read file at source path as a template, render with provided data, then write to destination path.',


  extendedDescription: 'Uses Lodash template syntax (e.g. `<%= %>`, `<%- %>`, `<% %>`)  Also provides access to the Node.js core utility module (as `util`), as well as Lodash itself (as `_`).',


  idempotent: true,


  inputs: {

    source: {
      description: 'The path on disk to the template file.',
      example: '/Users/mikermcneil/.tmp/foo.tpl',
      required: true
    },

    destination: {
      description: 'The path on disk where the resulting file should be written',
      example: '/Users/mikermcneil/.tmp/bar.md',
      required: true
    },

    data: {
      friendlyName: 'Template data',
      description: 'The data which will be accessible from the template',
      extendedDescription: 'Each key will be a variable accessible in the template.  For instance, if you supply an array `[{name:"Chandra"}, {name:"Mary"}]` as the key "friends", then you will be able to access `friends` from the template; i.e. `<ul><% _.each(friends, function (friend){ %><li><%= friend.name %></li> <%}); %></ul>`  Use `<%= %>` to inject the contents of a variable as-is, `<%- %>` to HTML-escape them first, or `<% %>` to execute some JavaScript code.',
      example: '===',
      readOnly: true
      // e.g. {
      //   email: {
      //     from: 'mikermcneil@sailsjs.org',
      //     subject: 'hello world!'
      //   },
      //   projectName: 'Bikrosoft (Confidential)'
      // }
    },

    force: {
      friendlyName: 'Force?',
      description: 'Whether or not to overwrite existing file(s).',
      example: false,
      defaultsTo: false
    }

  },


  exits: {

    success: {
      description: 'File written successfully.'
    },

    noTemplate: {
      description: 'Source template file not found.'
    },

    missingData: {
      friendlyName: 'missing data',
      description: 'One or more variables used in the template were not provided in the template data.',
      variableName: 'info',
      example: {
        message: 'Some variables (`me`,`friends`) were used in template "/code/machine/docs/.type-table.tpl", but not provided in the template data dictionary.',
        missingVariables: ['me', 'friends']
      }
    },

    couldNotRender: {
      description: 'Could not render the template due to invalid or unparseable syntax.'
    },

    alreadyExists: {
      description: 'Something already exists at the specified path (overwrite by enabling the `force` input)'
    }

  },


  fn: function (inputs, exits) {
    var thisPack = require('../');
    var MPStrings = require('machinepack-strings');

    // Read template from disk
    thisPack.read({
      source: inputs.source
    }).exec({
      error: exits.error,
      doesNotExist: exits.noTemplate,
      success: function (templateStr) {
        MPStrings.template({
          templateStr: templateStr,
          data: inputs.data
        }).exec({
          error: exits.error,
          missingData: exits.missingData,
          couldNotRender: exits.couldNotRender,
          success: function (renderedStr) {
            thisPack.write({
              destination: inputs.destination,
              string: renderedStr,
              force: inputs.force
            }).exec({
              error: exits.error,
              alreadyExists: exits.alreadyExists,
              success: exits.success
            });
          }
        });
      }
    });

  }
};
