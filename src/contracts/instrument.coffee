esprima = require 'esprima'

parseSignatures = require '../parseSignatures'
traverse = require '../traverse'

instrument = (code) ->

  tree = esprima.parse code, { comment: true, loc: true, range: true }
  signatures = parseSignatures tree.comments

  functionList = []

  findScope = (range) ->
    i = functionList.length - 1
    while i > 0
      fn = functionList[i]
      return fn if range < fn.end
      i -= 1

    null


  traverse tree, (node, path) ->
    if node.type is 'ReturnStatement'
      obj = findScope node.range[1]

      functionList.push {
        name: 'return'
        fn: obj && obj.name
        range: node.range
      }

    else if node.type is 'FunctionDeclaration'
      functionList.push {
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
          functionList.push {
            name: code.slice(parent.left.range[0], parent.left.range[1] + 1)
            range: node.range
            blockStart: node.body.range[0]
            end: node.body.range[1]
          }

      else if parent.type is 'VariableDeclarator'
        functionList.push {
          name: parent.id.name
          range: node.range
          blockStart: node.body.range[0]
          end: node.body.range[1]
        }

      else if parent.type is 'CallExpression'
        functionList.push {
          name: if parent.id then parent.id.name else '[Anonymous]'
          range: node.range
          blockStart: node.body.range[0]
          end: node.body.range[1]
        }

      else if typeof parent.length is 'number'
        functionList.push {
          name: if parent.id then parent.id.name else '[Anonymous]'
          range: node.range
          blockStart: node.body.range[0]
          end: node.body.range[1]
        }

      else if typeof parent.key isnt 'undefined'
        if parent.key.type is 'Identifier'
          if parent.value is node and parent.key.name
            functionList.push {
              name: parent.key.name
              range: node.range
              blockStart: node.body.range[0]
              end: node.body.range[1]
            }




  # Insert the instrumentation code from the last entry.
  # This is to ensure that the range for each entry remains valid)
  # (it won't shift due to some new inserting string before the range).
  i = functionList.length - 1
  while i >= 0

    if functionList[i].name is 'return'
      pos = functionList[i].range[0] + 6
      args = code.slice pos, functionList[i].range[1]
      args = if !!args then args else 'undefined'
      signature = "_$TypedJS.ret('#{functionList[i].fn}', #{args})"
      code = "#{code.slice(0, pos)} #{signature} #{code.slice(functionList[i].range[1], code.length)}"
    else
      signature = "_$TypedJS.args('#{functionList[i].name}', arguments);"
      pos = functionList[i].blockStart + 1
      code = "#{code.slice(0, pos)}\n#{signature}#{code.slice(pos, code.length)}"

    i -= 1


  result =
    instrumentedCode: code
    signatures: signatures

  result


module.exports = instrument
