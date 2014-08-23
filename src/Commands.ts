import util = require('util');
import Util = require('./Util');
import Javascript = require('./Javascript');
import Test = require('./Test');
import JasmineParser = require('./JasmineParser');
import path = require('path');
import parseFiles = require('./ParseFiles');
import _ = require('lodash');
var extend = require('extend');

module Commands {
    export function init(configFile) {
        Util.writeConfigFile(configFile);
    }

    export function discover(config: Util.Config, outputFile: string) {
        var di = require('karma/node_modules/di');
        var cfg = require('karma/lib/config');
        var logger = require("karma/lib/logger");
        var preprocessor = require('karma/lib/preprocessor');
        var fileList = require('karma/lib/file_list').List;
        var emitter = require('karma/lib/events').EventEmitter;
        var karmaConfigFile = path.resolve(config.karmaConfigFile);

        // Config
        logger.setup('INFO', false);
        var log = Util.createLogger(logger);

        var karmaConfig: any = {
            singleRun: true,
            browsers: [
                //'PhantomJS'
            ],
            reporters: [
                //'dots'
            ],
            colors: false,
            logLevel: 'INFO'
        };

        if (_.isObject(config.config)) {
            karmaConfig = extend(karmaConfig, config.config);
        }

        karmaConfig = cfg.parseConfig(karmaConfigFile, karmaConfig);

        var modules = [{
            logger: ['value', logger],
            emitter: ['type', emitter],
            config: ['value', karmaConfig],
            preprocess: ['factory', preprocessor.createPreprocessor],
            fileList: ['type', fileList]
        }];

        var discoverTests;
        discoverTests = function (fileList, logger) {
            var karma = new Test.Karma();

            karma.add(new Test.KarmaConfig(karmaConfig));

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

    export function run(config: Util.Config, outputFile: string, port?) {
        var server = require('karma').server;
        var karmaConfig: any = {
            configFile: path.resolve(config.karmaConfigFile),
            reporters: ['progress', 'vs'],
            singleRun: true,
            colors: false
        };

        if (_.isObject(config.config)) {
            karmaConfig = extend(karmaConfig, config.config);
        }

        karmaConfig.vsReporter = {
            outputFile: outputFile
        };

        if (port) {
            karmaConfig.port = port;
        }

        server.start(karmaConfig, function (exitCode) {
            process.exit(exitCode);
        });
    }
}

export = Commands;