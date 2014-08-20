import fs = require('fs');
import path = require('path');
import util = require('util');

import Util = require('./src/Util');
import Javascript = require('./src/Javascript');
import Test = require('./src/Test');
import JasmineParser = require('./src/JasmineParser');

var karma = require('karma');
var di = require('karma/node_modules/di');
var cfg = require('karma/lib/config');
var logger = require("karma/lib/logger");
var preprocessor = require('karma/lib/preprocessor');
var fileList = require('karma/lib/file_list').List;
var emitter = require('karma/lib/events').EventEmitter;

var jasmineParser = new JasmineParser();



// Config
logger.setup('INFO', false);
var config = cfg.parseConfig(path.resolve('karma.conf.js'), {
    singleRun: true,
    browsers: [
        'PhantomJS'
    ],
    reporters: ['dots'],
    colors: true,
    logLevel: 'INFO',
});

var modules = [{
    logger: ['value', logger],
    emitter: ['type', emitter],
    config: ['value', config],
    preprocess: ['factory', preprocessor.createPreprocessor],
    fileList: ['type', fileList]
}];

var getFiles: any;
getFiles = function (fileList, logger) {
    var log = logger.create('reporter.vs');
    var results = new Test.Results();
    var filesPromise = fileList.refresh();
    filesPromise.then(function (files) {
        files.served.forEach(function (file) {
            var testFile = new Test.File(file.path);
            var jsFile = new Javascript.Program({ path: file.path, content: file.content });
            jasmineParser.parse(jsFile, testFile);
            results.add(testFile);
            log.info('File parsed: ' + testFile.path);
        });
        var xml = results.toXml();
        Util.writeFile('slam.xml', results.toXml());
    });
}
getFiles.$inject = ['fileList', 'logger'];

var injector = new di.Injector(modules);

injector.invoke(getFiles);
