describe('sanity', function(){
  describe('require("sails-hook-grunt")', function(){
    it('should work', function(){
      var hook = require('../../');
      assert(hook);
    });
    it('should come back with a function', function(){
      var hook = require('../../');
      assert(_.isFunction(hook));
    });
  });
});
