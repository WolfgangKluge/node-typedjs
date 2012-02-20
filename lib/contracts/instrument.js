(function() {
  var esprima, instrument, parseSignatures, traverse;

  esprima = require('esprima');

  parseSignatures = require('../parseSignatures');

  traverse = require('../traverse');

  instrument = function(code) {
    var args, findScope, functionList, i, pos, result, signature, signatures, tree;
    tree = esprima.parse(code, {
      comment: true,
      loc: true,
      range: true
    });
    signatures = parseSignatures(tree.comments);
    functionList = [];
    findScope = function(range) {
      var fn, i;
      i = functionList.length - 1;
      while (i > 0) {
        fn = functionList[i];
        if (range < fn.end) return fn;
        i -= 1;
      }
      return null;
    };
    traverse(tree, function(node, path) {
      var obj, parent;
      if (node.type === 'ReturnStatement') {
        obj = findScope(node.range[1]);
        return functionList.push({
          name: 'return',
          fn: obj && obj.name,
          range: node.range
        });
      } else if (node.type === 'FunctionDeclaration') {
        return functionList.push({
          name: node.id.name,
          range: node.range,
          blockStart: node.body.range[0],
          end: node.body.range[1]
        });
      } else if (node.type === 'FunctionExpression') {
        parent = path[0];
        if (parent.type === 'AssignmentExpression') {
          if (typeof parent.left.range !== 'undefined') {
            ({
              name: parent.id ? parent.id.name : '[Anonymous]'
            });
            return functionList.push({
              name: code.slice(parent.left.range[0], parent.left.range[1] + 1),
              range: node.range,
              blockStart: node.body.range[0],
              end: node.body.range[1]
            });
          }
        } else if (parent.type === 'VariableDeclarator') {
          return functionList.push({
            name: parent.id.name,
            range: node.range,
            blockStart: node.body.range[0],
            end: node.body.range[1]
          });
        } else if (parent.type === 'CallExpression') {
          return functionList.push({
            name: parent.id ? parent.id.name : '[Anonymous]',
            range: node.range,
            blockStart: node.body.range[0],
            end: node.body.range[1]
          });
        } else if (typeof parent.length === 'number') {
          return functionList.push({
            name: parent.id ? parent.id.name : '[Anonymous]',
            range: node.range,
            blockStart: node.body.range[0],
            end: node.body.range[1]
          });
        } else if (typeof parent.key !== 'undefined') {
          if (parent.key.type === 'Identifier') {
            if (parent.value === node && parent.key.name) {
              return functionList.push({
                name: parent.key.name,
                range: node.range,
                blockStart: node.body.range[0],
                end: node.body.range[1]
              });
            }
          }
        }
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
