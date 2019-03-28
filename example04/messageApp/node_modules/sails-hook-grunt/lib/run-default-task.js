/**
 * Module dependencies
 */

var fs = require('fs');
var path = require('path');
var helpRunTask = require('./help-run-task');



/**
 * runDefaultTask()
 *
 * Run the appropriate default Grunt task.
 *
 * @param {SailsApp} sails
 * @param {Function} cb
 */
module.exports = function runDefaultTask(sails, cb) {

  // Determine the proper Grunt task to run.
  var gruntTaskListName;

  // Check to see if the user has specified a grunt task list for the current environment
  // (i.e. sails.config.environment)
  //
  // Note: Your asset pipeline can also be made environment-specific by checking
  // `sails.config.environment` from within the Gruntfile itself, or any task.
  // This convenience feature exists to make it easier to drop in an environment-specific
  // task list without doing any manual config or imperative coding.
  //
  // Docs on how to work with the default Grunt asset pipeline here:
  // http://sailsjs.org/documentation/concepts/assets/default-tasks
  var pathForEnvSpecificTaskList = path.resolve( sails.config.appPath, path.join('tasks/register/',sails.config.environment + '.js') );
  if ( fs.existsSync(pathForEnvSpecificTaskList) ) {
    gruntTaskListName = sails.config.environment;
  }
  // If the environment is "production", use the "prod" tasklist (unless a "production" tasklist exists)
  else if (sails.config.environment === 'production') {
    gruntTaskListName = 'prod';
  }
  else {
    gruntTaskListName = 'default';
  }

  sails.log.silly('Running default Grunt task (`'+gruntTaskListName+'`)...');

  // Now run the appropriate Grunt task for this environment
  // (spinning up a child process)
  helpRunTask(sails, gruntTaskListName, cb);

};
