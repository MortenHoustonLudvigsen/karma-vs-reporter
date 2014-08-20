var Util = require('./Util');

var Test = require('./Test');
var q = require('q');
var path = require('path');

var parseFiles = require('./ParseFiles');

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
        log.info("onRunStart");
        testResults = new Test.Results();
        log.info("onRunStart - testResults created");
        testResults.add(new Test.KarmaConfig(config));
        log.info("onRunStart - testResults added");
        results = [];
        filesParsed = q.defer();
        filesPromise.then(function (files) {
            log.info("onRunStart - files loaded");
            parseFiles(testResults, files, log);
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
        log.info('onRunComplete');
        filesParsed.promise.then(function () {
            log.info('onRunComplete - files parsed');
            results.forEach(function (res) {
                log.info('onRunComplete - result processing started');
                log.info(res);
                var parent = testResults;
                res.result.suite.forEach(function (s) {
                    parent = parent.add(new Test.Suite(s));
                });
                var test = new Test.Test(res.result.description);
                test.id = res.result.id;
                test.browser = res.browser.name;
                test.time = res.result.time;
                test.outcome = getOutcome(res.result);

                res.result.log.forEach(function (line) {
                    test.log.push(formatError(line).replace(/\s+$/, ''));
                });

                parent.add(test);
            });
            log.info('onRunComplete - results processed');

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
