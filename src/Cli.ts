import Util = require('./Util');
import Commands = require('./Commands');

module Cli {
    export function run() {
        var argv = require('yargs').argv;
        var outputFile = argv.o || Util.outputFile;
        var port = argv.p;
        var command: string = argv._[0] || '';

        //console.log({
        //    Config: Util.config,
        //    outputFile: outputFile,
        //    port: port,
        //    command: command
        //});

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
}

export = Cli;