(function() {
  var parseSignatures, typedjs_parser;

  typedjs_parser = '../packages/TypedJS/typedjs_parser.js';

  parseSignatures = function(comments) {
    var signatures;
    signatures = {};
    comments.forEach(function(comment) {
      var signature;
      if (comment.value[0] === '+') {
        comment = '//' + comment.value;
        signature = JSON.parse(typedjs_parser.parse(comment));
        if (signature.func) {
          signature.value = comment;
          return signatures[signature.func] = signature;
        }
      }
    });
    return signatures;
  };

  module.exports = parseSignatures;

}).call(this);
