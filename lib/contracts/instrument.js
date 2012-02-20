(function() {
  var instrument, traverse;

  traverse = require('../traverse');

  instrument = function(code) {
    var args, functionList, i, pos, result, signature, signatures;
    signatures = {};
    functionList = [];
    traverse(code, function(type, item) {
      if (type === 'function') {
        return functionList.push(item);
      } else if (type === 'signatures') {
        return signatures = item;
      }
    });
    i = functionList.length - 1;
    while (i >= 0) {
      if (functionList[i].name === 'return') {
        pos = functionList[i].range[0] + 6;
        args = code.slice(pos, functionList[i].range[1]);
        args = !!args ? args : 'undefined';
        signature = "_$TypedJS.ret('" + functionList[i].fn + "', " + args + ")";
        code = "" + (code.slice(0, pos)) + " " + signature + " " + (code.slice(functionList[i].range[1], code.length));
      } else {
        signature = "_$TypedJS.args('" + functionList[i].name + "', arguments);";
        pos = functionList[i].blockStart + 1;
        code = "" + (code.slice(0, pos)) + "\n" + signature + (code.slice(pos, code.length));
      }
      i -= 1;
    }
    result = {
      instrumentedCode: code,
      signatures: signatures
    };
    return result;
  };

  module.exports = instrument;

}).call(this);
