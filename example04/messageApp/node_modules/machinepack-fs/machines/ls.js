module.exports = {


  friendlyName: 'List contents (ls)',


  description: 'List contents of a directory on the local filesystem.',


  cacheable: true,


  inputs: {

    dir: {
      friendlyName: 'Directory path',
      example: '/Users/mikermcneil/.tmp/foo',
      description: 'Path to the directory whose contents should be listed.',
      extendedDescription: 'If a relative path is provided, it will be resolved to an absolute path from the context of the current working directory.',
      required: true
    },

    depth: {
      friendlyName: 'Depth',
      description: 'The maximum number of "hops" (i.e. directories deep) to include directory contents from.',
      extendedDescription: 'For instance, if you are running `ls` on "foo/" which has a subdirectory "foo/bar/baz/", if `depth` is set to 2, the results will include "foo/bar/baz/", but none of the files/folders contained within.',
      example: 1,
      defaultsTo: 1
    },

    includeFiles: {
      friendlyName: 'Files?',
      description: 'Whether or not to include files',
      example: true,
      defaultsTo: true
    },

    includeDirs: {
      friendlyName: 'Directories?',
      description: 'Whether or not to include directories',
      example: true,
      defaultsTo: true
    },

    includeSymlinks: {
      friendlyName: 'Symlinks?',
      description: 'Whether or not to include symbolic links',
      example: true,
      defaultsTo: true
    },

    includeHidden: {
      friendlyName: 'Hidden entries?',
      description: 'Whether or not to include hidden files/directories/symlinks',
      example: false,
      defaultsTo: false
    }

  },


  exits: {

    doesNotExist: {
      description: 'Nothing exists at the specified directory path.'
    },

    success: {
      variableName: 'dirContents',
      example: [
        '/Users/mikermcneil/.tmp/foo/.gitignore'
      ]
    }

  },


  fn: function (inputs, exits) {
    var path = require('path');
    var Walker = require('walker');

    // Ensure we've got an absolute path.
    inputs.dir = path.resolve(inputs.dir);

    // Determine the depth of the top-level directory we're walking,
    // for comparison later on.
    var topLvlDirDepth = inputs.dir.split(path.sep).length;

    // Initialize the walker and teach it to skip walking directories
    // that are:
    // • deeper than requested, or
    // • hidden (if the `includeHidden` input is set to false)
    var walker = Walker(inputs.dir);
    walker.filterDir(function(dir, stat) {
      // Too deep
      if (dir.split(path.sep).length > (topLvlDirDepth + inputs.depth)) {
        return false;
      }
      // Too hidden
      if (path.basename(dir).match(/^\./) && !inputs.includeHidden) {
        return false;
      }
      return true;
    });

    // Accumulate results array by listing file, directory, and/or symlink
    // entries from the specified directory.
    var results = [];
    if (inputs.includeFiles) {
      walker.on('file', function (entry, stat) {
        // Add the new entry to our result list unless it is:
        //  • hidden (and the `includeHidden` input is set to false), or
        //  • too deep
        var tooHidden = path.basename(entry).match(/^\./) && !inputs.includeHidden;
        var tooDeep = entry.split(path.sep).length > (topLvlDirDepth + inputs.depth);
        if ( !tooHidden && !tooDeep  ) {
          results.push(entry);
        }
      });
    }
    if (inputs.includeDirs) {
      walker.on('dir', function (entry, stat) {
        // If this is the top-level directory, exclude it.
        if (entry === inputs.dir) { return; }
        // Add the new entry to our result list unless it is:
        //  • hidden (and the `includeHidden` input is set to false)
        var tooHidden = path.basename(entry).match(/^\./) && !inputs.includeHidden;
        if ( !tooHidden ) {
          results.push(entry);
        }
      });
    }
    if (inputs.includeSymlinks) {
      walker.on('symlink', function (entry, stat) {
        // If this is the top-level directory, exclude it.
        if (entry===inputs.dir) { return; }
        // Add the new entry to our result list unless it is:
        //  • hidden (and the `includeHidden` input is set to false)
        var tooHidden = path.basename(entry).match(/^\./) && !inputs.includeHidden;
        if ( !tooHidden ) {
          results.push(entry);
        }
      });
    }

    // When walking is done, because of an error or otherwise,
    // return the results.
    var spinlock;
    walker.on('error', function (err){
      if (spinlock) { return; }
      spinlock = true;
      if (err.code === 'ENOENT') {
        return exits.doesNotExist();
      }
      return exits.error(err);
    });
    walker.on('end', function (){
      if (spinlock) { return; }
      spinlock = true;
      return exits.success(results);
    });
  }
};


