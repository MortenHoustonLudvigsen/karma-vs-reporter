var Util = require('./Util');

var Test = require('./Test');
var q = require('q');
var path = require('path');

var Reporter;
Reporter = function Reporter(baseReporterDecorator, config, fileList, helper, logger, formatError, emitter) {
    baseReporterDecorator(this);

    var log = Util.createLogger(logger);
    var outputFile = helper.normalizeWinPath(path.resolve(config.basePath, Util.outputFile));
    var filesPromise = fileList.refresh();

    emitter.on('file_list_modified', function (emittedFilesPromise) {
        filesPromise = emittedFilesPromise;
    });

    var filesParsed;
    var results;
    var testResults;

    this.onRunStart = function () {
        testResults = new Test.Results();
        results = [];
        filesParsed = q.defer();
        filesPromise.then(function (files) {
            Util.parseFiles(testResults, files, log);
            filesParsed.resolve();
        });
    };

    this.onBrowserStart = function (browser) {
    };

    this.onBrowserComplete = function (browser) {
    };

    this.onSpecComplete = function (browser, result) {
        results.push({ browser: browser, result: result });
    };

    this.onRunComplete = function () {
        filesParsed.promise.then(function () {
            results.forEach(function (res) {
                var parent = testResults;
                res.suite.forEach(function (s) {
                    parent = parent.add(new Test.Suite(s));
                });
                var test = new Test.Test(res.description);
                test.id = res.id;
                test.browser = res.browser;
                test.time = res.time;
                test.outcome = getOutcome(res);

                res.log.forEach(function (err) {
                    test.log.push(formatError(err).replace(/\s+$/, ''));
                });

                parent.add(test);
            });

            helper.mkdirIfNotExists(path.dirname(outputFile), function () {
                Util.writeFile(outputFile, testResults.toXml());
            });
        });
    };

    // wait for writing all the xml files, before exiting
    //this.onExit = function (done) {
    //};
    function getOutcome(result) {
        if (result.success)
            return 0 /* Success */;
        if (result.skipped)
            return 1 /* Skipped */;
        return 2 /* Failed */;
    }
};

Reporter.$inject = ['baseReporterDecorator', 'config', 'fileList', 'helper', 'logger', 'formatError', 'emitter'];

module.exports = Reporter;
//# sourceMappingURL=Reporter.js.map
