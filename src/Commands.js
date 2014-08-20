var Util = require('./Util');

var Test = require('./Test');

var path = require('path');
var parseFiles = require('./ParseFiles');

var Commands;
(function (Commands) {
    function init() {
        Util.writeConfigFile();
    }
    Commands.init = init;

    function discover(outputFile) {
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
            var results = new Test.Results();

            results.add(new Test.KarmaConfig(config));

            fileList.refresh().then(function (files) {
                try  {
                    parseFiles(results, files, log);
                    var xml = results.toXml();
                    Util.writeFile(outputFile, results.toXml());
                } catch (e) {
                    log.error(e);
                }
            });
        };
        discoverTests.$inject = ['fileList', 'logger'];

        try  {
            new di.Injector(modules).invoke(discoverTests);
        } catch (e) {
            log.error(e);
        }
    }
    Commands.discover = discover;

    function run(outputFile, port) {
        var server = require('karma').server;
        var config = {
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
    Commands.run = run;
})(Commands || (Commands = {}));

module.exports = Commands;
//# sourceMappingURL=Commands.js.map
