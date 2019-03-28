/**
 * Module dependencies
 */

var runDefaultTask = require('./lib/run-default-task');
var helpRunTask = require('./lib/help-run-task');


/**
 * Grunt hook
 *
 * @param  {SailsApp} sails
 * @return {Dictionary} [hook definition]
 */
module.exports = function (sails) {

  /**
   * Grunt hook
   *
   * Build the hook definition.
   * (this is returned below)
   *
   * @type {Dictionary}
   *
   * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
   * A core hook for interacting with the Grunt-powered pipeline which
   * is the conventional default in all new Sails apps.
   *
   *
   * @event 'hook:grunt:loaded'
   *        Emitted when the Grunt hook has been automatically loaded by Sails core, and
   *        triggered the callback in its `initialize` function.
   *
   * @event 'hook:grunt:done'
   *        Emitted when the Grunt child process exits with a normal status code.
   *        (in development, this will not fire until the app is lowered, since grunt-contrib-watch
   *         keeps the child process active)
   *
   * @event 'hook:grunt:error'
   *        Emitted when the Grunt child process exits with a non-zero status code.
   *
   *
   * > In development, note that *neither* the `grunt:hook:done`, *nor* the `grunt:hook:done` event will
   * > fire until the app is lowered if you're using the default pipeline.
   * > (This is because `grunt-contrib-watch` keeps the child process active.)
   *
   *
   * @stability 2
   * @see http://sailsjs.org/documentation/concepts/assets
   * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
   */
  return {



    /**
     * defaults
     *
     * The implicit configuration defaults merged into `sails.config` by this hook.
     *
     * @type {Dictionary}
     */
    defaults: {

      // 2 minutes.  You get 2 minutes.
      grunt: {
        _hookTimeout: 120000
      }

    },



    /**
     * configure()
     *
     * @type {Function}
     */
    configure: function() {

    },



    /**
     * initialize()
     *
     * Logic to run when this hook loads.
     */
    initialize: function (done) {

      // Expose `sails.hooks.grunt.runTask` function.
      sails.hooks.grunt.runTask = function (taskName, cb){
        helpRunTask(sails, taskName, cb);
      };//</define sails.hooks.grunt.runTask()>

      return runDefaultTask(sails, done);
    },



    /**
     * sails.hooks.grunt.teardown()
     */
    teardown: function (done) {
      return done();
    }


  };
};
