/**
 * Module dependencies
 */

//  N/A



/**
 * After ensuring a chunk is a string, trim any leading or
 * trailing whitespace.  If chunk cannot be nicely casted to a string,
 * pass it straight through.
 *
 * TODO: use `util.inspect()` and/or `rttc.compile()`to squeeze better string output out of non-strings.
 * TODO: maybe use `_.trim()`
 *
 * @param  {*} chunk
 * @return {*}
 */
module.exports = function sanitizeGruntOutputChunk(chunk) {

  if (chunk && typeof chunk === 'object' && chunk.toString) {
    chunk = chunk.toString();
  }
  if (typeof chunk === 'string') {
    chunk = chunk.replace(/^[\s\n]*/, '');
    chunk = chunk.replace(/[\s\n]*$/, '');
  }
  return chunk;
};
