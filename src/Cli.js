var Util = require('./Util');
var Commands = require('./Commands');

var Cli;
(function (Cli) {
    function run() {
        var argv = require('yargs').argv;

        var args = {
            outputFile: argv.o || Util.outputFile,
            configFile: argv.c || Util.configFile,
            port: argv.p,
            command: argv._[0] || '',
            config: Util.readConfigFile(argv.c || Util.configFile)
        };

        switch (args.command.toLowerCase()) {
            case "init":
                Commands.init(args.configFile);
                break;
            case "discover":
                Commands.discover(args.config, args.outputFile);
                break;
            case "run":
                Commands.run(args.config, args.outputFile, args.port);
                break;
            default:
                console.error("Command " + JSON.stringify(args.command) + " not recognized");
                process.exit(1);
                break;
        }
    }
    Cli.run = run;
})(Cli || (Cli = {}));

module.exports = Cli;
//# sourceMappingURL=Cli.js.map
