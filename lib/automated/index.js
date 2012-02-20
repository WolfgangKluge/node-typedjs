(function() {
  var Tests, typedjs;

  typedjs = require('./typedjs_vm');

  Tests = (function() {

    function Tests() {}

    Tests.prototype.tests = [];

    Tests.prototype.data = null;

    Tests.prototype.add = function(signature, func) {
      return this.tests.push(typedjs.addTest(signature, func));
    };

    Tests.prototype.string = function(code, extract) {
      this.data = typedjs.run_tests_on_string(code);
      return this.data[0].length === 0;
    };

    Tests.prototype.run = function() {
      this.data = typedjs.go(this.tests);
      return this.data[0].length === 0;
    };

    Tests.prototype.clear = function() {
      return this.tests = [];
    };

    return Tests;

  })();

  module.exports = Tests;

}).call(this);
