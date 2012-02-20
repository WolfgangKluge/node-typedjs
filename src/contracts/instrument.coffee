traverse = require '../traverse'

instrument = (code) ->

  signatures = {}
  functionList = []

  traverse code, (type, item) ->
    if type is 'function'
      functionList.push item
    else if type is 'signatures'
      signatures = item


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
