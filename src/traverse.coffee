traverse = (object, visitor, master) ->

  parent = if master is 'undefined' then [] else master

#  if typeof master is 'undefined'
#    parent = []
#  else
#    parent = master

  return if visitor.call(null, object, parent) is false

  Object.keys(object).forEach (key) ->
    child = object[key]
    path = [object]
    path.push parent

    traverse(child, visitor, path) if typeof child is 'object' and child isnt null


module.exports = traverse
