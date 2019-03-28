/**
 * Module dependencies
 */

var path = require('path');
var _ = require('@sailshq/lodash');
var includeAll = require('include-all');



/**
 * require('sails-hook-grunt/accessible/load-grunt-tasks')
 *
 * Load built-in Grunt plugins, plus userland tasks+config from the conventional paths
 * relative to the provided `appPath` (and using the given `grunt` instance.)
 *
 * > This should not be modified.
 * > Its main jobs are to eliminate the need for an extra `include-all`
 * > dep. in userland just to load Grunt tasks/configs, as well as to
 * > avoid having to bundle tons of deps for the default asset pipeline
 * > as direct userland dependencies in new Sails apps.
 * >
 * > (The default Gruntfile.js calls this function directly-- this is
 * > partially to make it easy to do any major customizations directly
 * > in that file.  But more importantly, it's because Grunt doesn't work
 * > without it.  At least not as of November, 2016.  Or as of Feb 2018.)
 *
 * @param {String} appPath
 * @param {Ref} grunt
 */
module.exports = function loadGruntTasks (appPath, grunt){


  // Load built-in Grunt plugins.
  // ========================================================
  var BUILT_IN_GRUNT_PLUGINS = [
    'grunt-contrib-clean',
    'grunt-contrib-coffee',
    'grunt-contrib-concat',
    'grunt-contrib-copy',
    'grunt-contrib-cssmin',
    'grunt-contrib-jst',
    'grunt-contrib-less',
    'grunt-hash',
    'grunt-sails-linker',
    'grunt-sync',
    '@sailshq/grunt-contrib-uglify',
    'grunt-contrib-watch',
    'grunt-babel'
  ];

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // > Note:
  // > This is based on implementation of loadNpmTasks as of Grunt v1.0.1:
  // > (https://github.com/gruntjs/grunt/blob/a09f84c8aedfc87cbf357b1ac45b7b70571e954f/lib/grunt/task.js#L368-L402)
  _.each(BUILT_IN_GRUNT_PLUGINS, function (packageName) {

    // First, we get the path to this dependency's base dir.
    // (see http://stackoverflow.com/a/34589830/486547)
    var depBaseDirPath = path.dirname(require.resolve(path.join(packageName, 'package.json')));

    // Then we get the path to its `tasks/` folder.
    var tasksFolderPath = path.join(depBaseDirPath, 'tasks/');

    // And finally, call `grunt.loadTasks()` on that.
    grunt.loadTasks(tasksFolderPath);

  });//</_.each()>
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


  // Load JavaScript files from `tasks/config/**/*` and `tasks/register/**/*`
  // ========================================================
  // Load Grunt configuration modules from the specified
  // relative path. These modules should export a function
  // that, when run, should either load/configure or register
  // a Grunt task.
  //
  // This uses the include-all library in order to require all of
  // the app's grunt configurations and task registrations dynamically.
  var helperTasks = includeAll({
    dirname: path.resolve(appPath, './tasks/config'),
    filter: /(.+)\.js$/,
    excludeDirs: /^\.(git|svn)$/
  }) || {};
  // Same thing for our main tasklists.
  var mainTasks = includeAll({
    dirname: path.resolve(appPath, './tasks/register'),
    filter: /(.+)\.js$/,
    excludeDirs: /^\.(git|svn)$/
  }) || {};


  // Ensure that a default task exists.
  // ========================================================
  if (!mainTasks.default) {
    mainTasks.default = function(grunt) {
      grunt.registerTask('default', []);
    };
  }


  // Run task functions to configure Grunt.
  // ========================================================
  // Invoke the function from each Grunt configuration module
  // with a single argument - the `grunt` object.
  Object.keys(helperTasks).forEach(function (taskName){
    helperTasks[taskName](grunt);
  });
  // Same thing for our main tasklists.
  Object.keys(mainTasks).forEach(function (taskName){
    mainTasks[taskName](grunt);
  });

};


