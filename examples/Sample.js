var typedjs = require('../lib/typed');

var fs = require('fs');
var vm = require('vm');

var code = fs.readFileSync('./examples/test.js', 'utf-8');
var tests = "fullname({ first: 'Josh', last: 'Perez' }); fullname(12);";

var context = typedjs(code);
vm.runInNewContext(tests, context);
