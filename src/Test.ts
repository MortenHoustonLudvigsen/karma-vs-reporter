import Javascript = require('./Javascript');
import Util = require("./Util");
import _ = require("lodash");

var xmlbuilder = require('xmlbuilder');

module Test {
    //function lazy<T>(init: () => T): T {
    //    var fn = function () {
    //        var 
    //    }
    //}

    export enum Outcome {
        Success,
        Skipped,
        Failed
    }

    export class Item {
        public children: Array<Item> = [];

        constructor() {
        }

        public add(item: Item): Item {
            this.children.push(item);
            return item;
        }

        public toXml(parentElement): any { }
    }

    export class Karma extends Item {
        constructor() {
            super();
        }

        public toXml(parentElement?): any {
            var element = xmlbuilder.create('Karma',
                { version: '1.0', encoding: 'UTF-8', standalone: true },
                { pubID: null, sysID: null },
                {
                    allowSurrogateChars: false, skipNullAttributes: true,
                    headless: false, ignoreDecorators: false, stringify: {}
                }
                );

            this.children.forEach(function (child) {
                child.toXml(element);
            });
            return element.end({ pretty: true });
        }

        public files(): Item {
            var files = this.add(new Container('Files'));
            this.files = function () {
                return files;
            };
            return this.files();
        }

        public results(): Item {
            var results = this.add(new Container('Results'));
            this.results = function () {
                return results;
            };
            return this.results();
        }
    }

    export class KarmaConfig extends Item {
        constructor(public config: any) {
            super();
        }

        public toXml(parentElement): any {
            return this.valueToXml(parentElement, 'Config', this.config);
        }

        private valueToXml(parentElement, name: string, value) {
            if (value === null || value === undefined) {
                return undefined;
            } else if (_.isString(value) || _.isBoolean(value) || _.isDate(value) || _.isNumber(value)) {
                return this.scalarToXml(parentElement, name, value);
            } else if (_.isArray(value)) {
                return this.arrayToXml(parentElement, name, value);
            } else if (_.isObject(value)) {
                return this.objectToXml(parentElement, name, value);
            }
        }

        private objectToXml(parentElement, name: string, object) {
            var element = this.createElement(parentElement, name);
            _.forIn(object, (value, property) => {
                this.valueToXml(element, property, value);
            });
            return element;
        }

        private scalarToXml(parentElement, name: string, value) {
            return this.createElement(parentElement, name, value);
        }

        private arrayToXml(parentElement, name: string, value) {
            var element = this.createElement(parentElement, name);
            _.forEach(value, item => {
                this.valueToXml(element, 'item', item);
            });
            return element;
        }

        private createElement(parentElement, name: string, value?) {
            if (/\W/.test(name)) {
                return parentElement.ele('item', { name: name }, value);
            } else {
                return parentElement.ele(name, value);
            }
        }
    }

    export class Container extends Item {
        constructor(private name: string) {
            super();
        }

        public toXml(parentElement): any {
            if (this.children.length > 0) {
                var element = parentElement.ele(this.name);
                this.children.forEach(function (child) {
                    child.toXml(element);
                });
                return element;
            }
        }
    }

    export class File extends Item {
        constructor(public path: string) {
            super();
            this.path = Util.resolvePath(this.path);
        }

        public toXml(parentElement): any {
            var element = parentElement.ele('File', {
                Path: this.path
            });
            this.children.forEach(function (child) {
                child.toXml(element);
            });
            return element;
        }
    }

    export class Suite extends Item {
        public framework: string;
        public position: Javascript.Position;
        public originalPosition: Javascript.MappedPosition;

        constructor(public name: string) {
            super();
        }

        public toXml(parentElement): any {
            var attributes: any = {
                Name: this.name,
                Framework: this.framework
            }

            if (this.position) {
                attributes.Line = this.position.line;
                attributes.Column = this.position.column;
            }

            var element = parentElement.ele('Suite', attributes);
            SourceToXml(element, this.originalPosition);
            this.children.forEach(function (child) {
                child.toXml(element);
            });
            return element;
        }
    }

    export class Test extends Item {
        public framework: string;
        public position: Javascript.Position;
        public originalPosition: Javascript.MappedPosition;
        public id: string;
        public browser: string;
        public time: number;
        public outcome: Outcome;
        public log: Array<string> = [];

        constructor(public name: string) {
            super();
        }

        public toXml(parentElement): any {
            var attributes: any = {
                Name: this.name,
                Framework: this.framework,
                Id: this.id,
                Browser: this.browser,
                Time: this.time,
                Outcome: this.outcome !== undefined ? Outcome[this.outcome] : undefined
            }

            if (this.position) {
                attributes.Line = this.position.line;
                attributes.Column = this.position.column;
            }

            var element = parentElement.ele('Test', attributes);
            SourceToXml(element, this.originalPosition);
            this.log.forEach(function (line) {
                element.ele('Log', line);
            });
            this.children.forEach(function (child) {
                child.toXml(element);
            });
            return element;
        }
    }

    function SourceToXml(parentElement, source: Javascript.MappedPosition): any {
        if (source) {
            return parentElement.ele('Source', {
                Path: source.source,
                Line: source.line,
                Column: source.column
            });
        }
    }
}

export = Test;