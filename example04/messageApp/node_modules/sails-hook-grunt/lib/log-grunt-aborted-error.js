/**
 * Module dependencies
 */

var path = require('path');
var chalk = require('chalk');


/**
 * logGruntAbortdError()
 *
 * Write a log message about the Grunt child process being aborted.
 *
 * @param  {String} consoleMsg
 * @param  {String} stackTrace
 * @param  {SailsApp} sails
 */
module.exports = function logGruntAbortedError(consoleMsg, stackTrace, sails) {

  var gruntErr =
    '\n------------------------------------------------------------------------\n' +
    consoleMsg + '\n' + (stackTrace || '') +
    '\n------------------------------------------------------------------------';
  sails.log.error(gruntErr);
  sails.log.blank();

  sails.log.error('Looks like a Grunt error occurred--');
  sails.log.error('Please fix it, then **restart Sails** to resume watching for changes to assets:');
  sails.log.error('     CTRL+C, then `sails lift`');
  sails.log.error('Or if you\'re stuck, check out the troubleshooting tips below.');
  sails.log.blank();

  sails.log.error(chalk.underline('Troubleshooting tips:'));
  var relativePublicPath = (path.resolve(sails.config.appPath, '.tmp'));
  var uid = process.getuid && process.getuid() || 'YOUR_COMPUTER_USER_NAME';
  sails.log.error();
  sails.log.error(' *-> Are "grunt" and any custom Grunt plugins you\'re using installed in this project?');
  sails.log.error('     Run `npm install` if you\'re not sure.');
  sails.log.error();
  sails.log.error(' *-> You might have a typo in one of your LESS files, etc.');
  sails.log.error();
  sails.log.error(' *-> Or maybe you don\'t have permissions to access the `.tmp` directory?');
  sails.log.error('     e.g., `' + relativePublicPath + '`', '?');
  sails.log.error();
  sails.log.error('     If you think this might be the case, try running:');
  sails.log.error('     sudo chown -R', uid, relativePublicPath);
  sails.log.error();
  sails.log.error(' *-> If you\'re still unsure, drop by https://sailsjs.com/support.');
  sails.log.blank();

  // This is not currently a fatal error (i.e. we don't terminate the process)
  // but do note that certain grunt modules (e.g. grunt-contrib-watch) don't restart
  // when an error occurs, so any time this is running, you'll really need to kill
  // the Sails app and restart it.
  //
  // That said, this _will not_ terminate the process.
  // The rest of Sails should continue to run, even though Grunt is stalled.

};
