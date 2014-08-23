﻿import Javascript = require('./Javascript');
import Test = require('./Test');

import fs = require('fs');
import path = require('path');
var extend = require('extend');

module Util {
    export interface Config {
        karmaConfigFile: string;
    }

    export var configFile = path.resolve('karma-vs-reporter.json');
    export var baseDir = process.cwd();
    export var outputFile = 'karma-vs-reporter.xml';
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
        return path.relative(baseDir, filepath).replace(/\\/g, '/');
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
        return logger.create('karma-vs-reporter');
    }
}

export = Util;