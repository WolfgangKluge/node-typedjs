var vm = require('vm');
var typedjs_parser = require('../packages/TypedJS/typedjs_parser.js');

var _$TypedJS = {
  typedjs: require('../packages/TypedJS/typed.js'),
  util: require('util'),

  signatures: {},

  // defines our type checking function
  args: function contractArgs(name, args) {
    var base = _$TypedJS.signatures[name];

    // If the type signature exists
    if (base) {
      base.args.forEach(function (arg, index) {
        // the last one is the Return
        if (index === base.args.length - 1) {
          return;
        }

        // Check the Type
        if (!_$TypedJS.typedjs.check_type(args[index], arg)) {
          throw new TypeError(name + ': Expected ' + _$TypedJS.util.inspect(arg) + ' but received ' + _$TypedJS.util.inspect(args[index]));
        }
      });
    }
  },

  ret: function contractReturn(name, value) {
    var base = _$TypedJS.signatures[name];
    var expected;

    if (base) {
      expected = base.args[base.args.length - 1];

      // Check the Type
      if (!_$TypedJS.typedjs.check_type(value, expected)) {
        throw new TypeError(name + ': Expected ' + _$TypedJS.util.inspect(expected) + ' but received ' + _$TypedJS.util.inspect(value));
      }
    }

    // return back to function so program works correctly
    return value;
  }
};

function createSandbox(signatures) {
  _$TypedJS.signatures = signatures;

  var context = vm.createContext();
  context._$TypedJS = _$TypedJS;
  context.typedjs_parser = typedjs_parser;

  return context;
}

module.exports = createSandbox;
