import Javascript = require('./Javascript');
import Util = require("./Util");

var xmlbuilder = require('xmlbuilder');

module Test {
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

    export class Results extends Item {
        constructor() {
            super();
        }

        public toXml(parentElement?): any {
            var element = xmlbuilder.create('TestResults',
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
            var element = parentElement.ele('Suite', {
                Name: this.name,
                Framework: this.framework,
                Line: this.position.line,
                Column: this.position.column
            });
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
            //var attributes = {
            //    Name: this.name
            //};

            //if (this.position) {
            //    attributes
            //}

            var element = parentElement.ele('Test', {
                Name: this.name,
                Framework: this.framework,
                Line: this.position.line,
                Column: this.position.column,
                Id: this.id,
                Browser: this.browser,
                Time: this.time,
                outcome: this.outcome !== undefined ? Outcome[this.outcome] : undefined
            });
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
            return parentElement.ele('Source', { Path: source.source, Line: source.line, Column: source.column });
        }
    }
}

export = Test;