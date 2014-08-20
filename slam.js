var Util = require('./src/Util');
var Javascript = require('./src/Javascript');
var Test = require('./src/Test');
var JasmineParser = require('./src/JasmineParser');

var jasmineParser = new JasmineParser();

var results = new Test.Results();

var files = [
    'testfiles/slam.js',
    'testfiles/QUnitTests.js'
];

files.forEach(function (file) {
    var testFile = new Test.File(file);
    var jsFile = new Javascript.Program({ path: testFile.path });
    jasmineParser.parse(jsFile, testFile);
    results.add(testFile);
});

var xml = results.toXml();

Util.writeFile('slam.xml', xml);
//console.log(xml);
//# sourceMappingURL=slam.js.map
