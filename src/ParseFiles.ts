import Test = require('./Test');
import Javascript = require('./Javascript');
import JasmineParser = require('./JasmineParser');

function parseFiles(karma: Test.Karma, files, log) {
    var jasmineParser = new JasmineParser();
    files.served.forEach(function (file) {
        try {
            var testFile = new Test.File(file.path);
            var jsFile = new Javascript.Program({ path: file.path, content: file.content });
            jasmineParser.parse(jsFile, testFile);
            karma.files().add(testFile);
        } catch (e) {
            log.error(e);
        }
    });
}

export = parseFiles;