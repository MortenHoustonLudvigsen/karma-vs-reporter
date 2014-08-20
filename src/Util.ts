import Javascript = require('./Javascript');
import Test = require('./Test');
import JasmineParser = require('./JasmineParser');

import fs = require('fs');
import path = require('path');
var extend = require('extend');

module Util {
    export interface Config {
        karmaConfigFile: string;
    }

    export var configFile = path.resolve('KarmaVSReporter.json');
    export var baseDir = process.cwd();
    export var outputFile = process.argv[2] || 'KarmaVSReporter.xml';
    export var config = getConfig();

    function getConfig(): Config {
        var config: Config = extend({
            karmaConfigFile: 'karma.conf.js'
        }, Try(() => readJsonFile(configFile)));
        return config;
    }

    export function writeConfigFile() {
        writeFile(configFile, JSON.stringify(config, null, 4));
    }

    export function resolvePath(filepath: string, relativeTo?: string) {
        if (relativeTo !== undefined) {
            relativeTo = resolvePath(relativeTo);
            if (!fs.lstatSync(relativeTo).isDirectory()) {
                relativeTo = path.dirname(relativeTo);
            }
            filepath = path.resolve(relativeTo, filepath);
        }
        return path.relative(baseDir, filepath).replace('\\', '/');
    }

    export function absolutePath(filepath: string, relativeTo?: string) {
        return path.resolve(baseDir, resolvePath(filepath, relativeTo));
    }

    export function readFile(filepath: string, relativeTo?: string) {
        return fs.readFileSync(absolutePath(filepath, relativeTo), 'utf8');
    }

    export function readJsonFile(filepath: string, relativeTo?: string) {
        return JSON.parse(readFile(filepath, relativeTo));
    }

    export function writeFile(filepath: string, data: any, relativeTo?: string) {
        return fs.writeFileSync(absolutePath(filepath, relativeTo), data, { encoding: 'utf8' });
    }

    export function ifTruthy<V, T>(value: V, action: (value: V) => T) {
        return value ? action(value) : undefined;
    }

    export function ifMatch<T>(re: RegExp, str: string, onMatch: (match: RegExpExecArray) => T) {
        return ifTruthy<RegExpExecArray, T>(re.exec(str), m => onMatch(m));
    }

    export function Try<T>(action: () => T, defaultResult?: T) {
        try {
            return action();
        } catch (e) {
            return defaultResult;
        }
    }

    export function createLogger(logger) {
        return logger.create('KarmaVSReporter');
    }

    export function parseFiles(testResults: Test.Results, files, log) {
        var jasmineParser = new JasmineParser();
        files.served.forEach(function (file) {
            try {
                var testFile = new Test.File(file.path);
                var jsFile = new Javascript.Program({ path: file.path, content: file.content });
                jasmineParser.parse(jsFile, testFile);
                testResults.add(testFile);
            } catch (e) {
                log.error(e);
            }
        });
    }
}

export = Util;