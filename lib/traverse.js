(function() {
  var traverse;

  traverse = function(object, visitor, master) {
    var parent;
    parent = master === 'undefined' ? [] : master;
    if (visitor.call(null, object, parent) === false) return;
    return Object.keys(object).forEach(function(key) {
      var child, path;
      child = object[key];
      path = [object];
      path.push(parent);
      if (typeof child === 'object' && child !== null) {
        return traverse(child, visitor, path);
      }
    });
  };

  module.exports = traverse;

}).call(this);
