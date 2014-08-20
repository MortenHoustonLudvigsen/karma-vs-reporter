var Util = require('./Util');
var Commands = require('./Commands');

var Cli;
(function (Cli) {
    function run() {
        var argv = require('yargs').argv;
        var outputFile = argv.o || Util.outputFile;
        var port = argv.p;
        var command = argv._[0] || '';

        switch (command.toLowerCase()) {
            case "init":
                Commands.init();
                break;
            case "discover":
                Commands.discover(outputFile);
                break;
            case "run":
                Commands.run(outputFile, port);
                break;
            default:
                console.error("Command " + JSON.stringify(command) + " not recognized");
                process.exit(1);
                break;
        }
    }
    Cli.run = run;
})(Cli || (Cli = {}));

module.exports = Cli;
//# sourceMappingURL=Cli.js.map
