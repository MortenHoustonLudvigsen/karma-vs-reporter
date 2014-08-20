var Test = require('./Test');
var Javascript = require('./Javascript');
var JasmineParser = require('./JasmineParser');

function parseFiles(testResults, files, log) {
    var jasmineParser = new JasmineParser();
    files.served.forEach(function (file) {
        try  {
            var testFile = new Test.File(file.path);
            var jsFile = new Javascript.Program({ path: file.path, content: file.content });
            jasmineParser.parse(jsFile, testFile);
            testResults.add(testFile);
        } catch (e) {
            log.error(e);
        }
    });
}

module.exports = parseFiles;
//# sourceMappingURL=ParseFiles.js.map
