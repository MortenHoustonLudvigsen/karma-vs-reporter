var Javascript = require('./Javascript');
var Test = require('./Test');
var JasmineParser = require('./JasmineParser');

var fs = require('fs');
var path = require('path');
var extend = require('extend');

var Util;
(function (Util) {
    Util.configFile = path.resolve('KarmaVSReporter.json');
    Util.baseDir = process.cwd();
    Util.outputFile = process.argv[2] || 'KarmaVSReporter.xml';
    Util.config = getConfig();

    function getConfig() {
        var config = extend({
            karmaConfigFile: 'karma.conf.js'
        }, Try(function () {
            return readJsonFile(Util.configFile);
        }));
        return config;
    }

    function writeConfigFile() {
        writeFile(Util.configFile, JSON.stringify(Util.config, null, 4));
    }
    Util.writeConfigFile = writeConfigFile;

    function resolvePath(filepath, relativeTo) {
        if (relativeTo !== undefined) {
            relativeTo = resolvePath(relativeTo);
            if (!fs.lstatSync(relativeTo).isDirectory()) {
                relativeTo = path.dirname(relativeTo);
            }
            filepath = path.resolve(relativeTo, filepath);
        }
        return path.relative(Util.baseDir, filepath).replace('\\', '/');
    }
    Util.resolvePath = resolvePath;

    function absolutePath(filepath, relativeTo) {
        return path.resolve(Util.baseDir, resolvePath(filepath, relativeTo));
    }
    Util.absolutePath = absolutePath;

    function readFile(filepath, relativeTo) {
        return fs.readFileSync(absolutePath(filepath, relativeTo), 'utf8');
    }
    Util.readFile = readFile;

    function readJsonFile(filepath, relativeTo) {
        return JSON.parse(readFile(filepath, relativeTo));
    }
    Util.readJsonFile = readJsonFile;

    function writeFile(filepath, data, relativeTo) {
        return fs.writeFileSync(absolutePath(filepath, relativeTo), data, { encoding: 'utf8' });
    }
    Util.writeFile = writeFile;

    function ifTruthy(value, action) {
        return value ? action(value) : undefined;
    }
    Util.ifTruthy = ifTruthy;

    function ifMatch(re, str, onMatch) {
        return ifTruthy(re.exec(str), function (m) {
            return onMatch(m);
        });
    }
    Util.ifMatch = ifMatch;

    function Try(action, defaultResult) {
        try  {
            return action();
        } catch (e) {
            return defaultResult;
        }
    }
    Util.Try = Try;

    function createLogger(logger) {
        return logger.create('KarmaVSReporter');
    }
    Util.createLogger = createLogger;

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
    Util.parseFiles = parseFiles;
})(Util || (Util = {}));

module.exports = Util;
//# sourceMappingURL=Util.js.map
