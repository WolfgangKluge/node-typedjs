esprima = require 'esprima'
parseSignatures = require './parseSignatures'

traverse = (object, visitor, master) ->

  parent = if master is 'undefined' then [] else master

  return if visitor.call(null, object, parent) is false

  Object.keys(object).forEach (key) ->
    child = object[key]
    path = [object]
    path.push parent

    traverse(child, visitor, path) if typeof child is 'object' and child isnt null


instrument = (code, cb) ->

  tree = esprima.parse code, { comment: true, loc: true, range: true }
  cb 'signatures', parseSignatures(tree.comments)

  list = []

  findScope = (range) ->
    i = list.length - 1
    while i > 0
      fn = list[i]
      return fn if range < fn.end
      i -= 1

    null


  emit = (obj) ->
    list.push obj
    cb 'function', obj


  traverse tree, (node, path) ->
    if node.type is 'ReturnStatement'
      obj = findScope node.range[1]

      emit {
        name: 'return'
        fn: obj && obj.name
        range: node.range
      }

    else if node.type is 'FunctionDeclaration'
      emit {
        name: node.id.name
        range: node.range
        blockStart: node.body.range[0]
        end: node.body.range[1]
      }

    else if node.type is 'FunctionExpression'
      parent = path[0]

      if parent.type is 'AssignmentExpression'
        if typeof parent.left.range isnt 'undefined'
          name: if parent.id then parent.id.name else '[Anonymous]'
          emit {
            name: code.slice(parent.left.range[0], parent.left.range[1] + 1)
            range: node.range
            blockStart: node.body.range[0]
            end: node.body.range[1]
          }

      else if parent.type is 'VariableDeclarator'
        emit {
          name: parent.id.name
          range: node.range
          blockStart: node.body.range[0]
          end: node.body.range[1]
        }

      else if parent.type is 'CallExpression'
        emit {
          name: if parent.id then parent.id.name else '[Anonymous]'
          range: node.range
          blockStart: node.body.range[0]
          end: node.body.range[1]
        }

      else if typeof parent.length is 'number'
        emit {
          name: if parent.id then parent.id.name else '[Anonymous]'
          range: node.range
          blockStart: node.body.range[0]
          end: node.body.range[1]
        }

      else if typeof parent.key isnt 'undefined'
        if parent.key.type is 'Identifier'
          if parent.value is node and parent.key.name
            emit {
              name: parent.key.name
              range: node.range
              blockStart: node.body.range[0]
              end: node.body.range[1]
            }




module.exports = instrument
