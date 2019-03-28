/**
 * A hack to exec grunt without knowing exactly where it is.
 *
 * grunt-cli could be installed as a peer to sails-hook-grunt, so we don't know
 * where its bin script might be. But require can find it. We have this thin
 * wrapper to be a script we can "exec" as a child process, such that doing so
 * will execute the grunt-cli, **wherever** that CLI happens to be installed.
 */

require('grunt-cli/bin/grunt');
