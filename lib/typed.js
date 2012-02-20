(function() {
  var contracts, createSandbox, fs, instrument, mixInto, vm;

  fs = require('fs');

  vm = require('vm');

  instrument = require('./instrument');

  createSandbox = require('./contracts');

  mixInto = function(base, obj) {
    if (base == null) base = {};
    if (obj == null) obj = {};
    Object.keys(obj).forEach(function(key) {
      return base[key] = obj[key];
    });
    return base;
  };

  contracts = function(code, sandbox) {
    var context, instrumentedCode, script, signatures, _ref;
    _ref = instrument(code), instrumentedCode = _ref.instrumentedCode, signatures = _ref.signatures;
    context = createSandbox(signatures);
    script = vm.createScript(instrumentedCode);
    context = mixInto(context, sandbox);
    script.runInContext(context);
    return context;
  };

  module.exports = contracts;

}).call(this);
