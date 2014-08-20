import Util = require('./Util');
import Javascript = require('./Javascript');
import Test = require('./Test');
import JasmineParser = require('./JasmineParser');
import path = require('path');

module Commands {
    export function discover() {
        var di = require('karma/node_modules/di');
        var cfg = require('karma/lib/config');
        var logger = require("karma/lib/logger");
        var preprocessor = require('karma/lib/preprocessor');
        var fileList = require('karma/lib/file_list').List;
        var emitter = require('karma/lib/events').EventEmitter;

        // Config
        logger.setup('INFO', false);
        var log = Util.createLogger(logger);
        var config = cfg.parseConfig(path.resolve(Util.config.karmaConfigFile), {
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

        var discoverTests;
        discoverTests = function (fileList, logger) {
            var results = new Test.Results();

            fileList.refresh().then(function (files) {
                try {
                    Util.parseFiles(results, files, log);
                    var xml = results.toXml();
                    Util.writeFile(Util.outputFile, results.toXml());
                } catch (e) {
                    log.error(e);
                }
            });
        }
        discoverTests.$inject = ['fileList', 'logger'];

        try {
            new di.Injector(modules).invoke(discoverTests);
        } catch (e) {
            log.error(e);
        }
    }
}

export = Commands;