(function() {
  var createSandbox, typedjs_parser, vm, _$TypedJS;

  vm = require('vm');

  typedjs_parser = '../packages/TypedJS/typedjs_parser.js';

  _$TypedJS = {
    typedjs: require('../packages/TypedJS/typed.js'),
    util: require('util'),
    signatures: {},
    args: function(name, args) {
      var base;
      base = _$TypedJS.signatures[name];
      if (base) {
        base.args.forEach(function(arg, index) {
          if (index === (base.args.length - 1)) return;
          if (!_$TypedJS.typedjs.check_type(args[index], arg)) {
            throw new TypeError("" + name + " Expected " + (_$TypedJS.util.inspect(arg)) + " but received " + (_$TypedJS.util.inspect(args[index])));
          }
        });
      }
      return base;
    },
    ret: function(name, value) {
      var base, expected;
      base = _$TypedJS.signatures[name];
      if (base) {
        expected = base.args[base.args.length - 1];
        if (!_$TypedJS.typedjs.check_type(value, expected)) {
          throw new TypeError("" + name + " Expected " + (_$TypedJS.util.inspect(expected)) + " but received " + (_$TypedJS.util.inspect(value)));
        }
      }
      return value;
    }
  };

  createSandbox = function(signatures) {
    var context;
    _$TypedJS.signatures = signatures;
    context = vm.createContext();
    context._$TypedJS = _$TypedJS;
    context.typedjs_parser = typedjs_parser;
    return context;
  };

  module.exports = createSandbox;

}).call(this);
