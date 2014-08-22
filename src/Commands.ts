import util = require('util');
import Util = require('./Util');
import Javascript = require('./Javascript');
import Test = require('./Test');
import JasmineParser = require('./JasmineParser');
import path = require('path');
import parseFiles = require('./ParseFiles');

module Commands {
    export function init() {
        Util.writeConfigFile();
    }

    export function discover(outputFile: string) {
        var di = require('karma/node_modules/di');
        var cfg = require('karma/lib/config');
        var logger = require("karma/lib/logger");
        var preprocessor = require('karma/lib/preprocessor');
        var fileList = require('karma/lib/file_list').List;
        var emitter = require('karma/lib/events').EventEmitter;

        // Config
        logger.setup('OFF', false);
        var log = Util.createLogger(logger);
        var config = cfg.parseConfig(path.resolve(Util.config.karmaConfigFile), {
            singleRun: true,
            browsers: [
                'PhantomJS'
            ],
            reporters: ['dots'],
            colors: true,
            logLevel: 'INFO'
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
            var karma = new Test.Karma();

            karma.add(new Test.KarmaConfig(config));

            fileList.refresh().then(function (files) {
                try {
                    parseFiles(karma, files, log);
                    var xml = karma.toXml();
                    Util.writeFile(outputFile, karma.toXml());
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

    export function run(outputFile: string, port?) {
        var server = require('karma').server;
        var config: any = {
            configFile: path.resolve(Util.config.karmaConfigFile),
            reporters: ['progress', 'vs'],
            singleRun: true,
            vsReporter: {
                outputFile: outputFile
            }
        };

        if (Util.port) {
            config.port = Util.port;
        }

        server.start(config, function (exitCode) {
            process.exit(exitCode);
        });
    }
}

export = Commands;