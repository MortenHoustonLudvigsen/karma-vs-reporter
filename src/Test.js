﻿var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Util = require("./Util");
var _ = require("lodash");

var xmlbuilder = require('xmlbuilder');

var Test;
(function (_Test) {
    (function (Outcome) {
        Outcome[Outcome["Success"] = 0] = "Success";
        Outcome[Outcome["Skipped"] = 1] = "Skipped";
        Outcome[Outcome["Failed"] = 2] = "Failed";
    })(_Test.Outcome || (_Test.Outcome = {}));
    var Outcome = _Test.Outcome;

    var Item = (function () {
        function Item() {
            this.children = [];
        }
        Item.prototype.add = function (item) {
            this.children.push(item);
            return item;
        };

        Item.prototype.toXml = function (parentElement) {
        };
        return Item;
    })();
    _Test.Item = Item;

    var KarmaConfig = (function (_super) {
        __extends(KarmaConfig, _super);
        function KarmaConfig(config) {
            _super.call(this);
            this.config = config;
        }
        KarmaConfig.prototype.toXml = function (parentElement) {
            return this.valueToXml(parentElement, 'KarmaConfig', this.config);
        };

        KarmaConfig.prototype.valueToXml = function (parentElement, name, value) {
            if (value === null || value === undefined) {
                return undefined;
            } else if (_.isString(value) || _.isBoolean(value) || _.isDate(value) || _.isNumber(value)) {
                return this.scalarToXml(parentElement, name, value);
            } else if (_.isArray(value)) {
                return this.arrayToXml(parentElement, name, value);
            } else if (_.isObject(value)) {
                return this.objectToXml(parentElement, name, value);
            }
        };

        KarmaConfig.prototype.objectToXml = function (parentElement, name, object) {
            var _this = this;
            var element = this.createElement(parentElement, name);
            _.forIn(object, function (value, property) {
                _this.valueToXml(element, property, value);
            });
            return element;
        };

        KarmaConfig.prototype.scalarToXml = function (parentElement, name, value) {
            return this.createElement(parentElement, name, value);
        };

        KarmaConfig.prototype.arrayToXml = function (parentElement, name, value) {
            var _this = this;
            var element = this.createElement(parentElement, name);
            _.forEach(value, function (item) {
                _this.valueToXml(element, 'item', item);
            });
            return element;
        };

        KarmaConfig.prototype.createElement = function (parentElement, name, value) {
            if (/\W/.test(name)) {
                return parentElement.ele('item', { name: name }, value);
            } else {
                return parentElement.ele(name, value);
            }
        };
        return KarmaConfig;
    })(Item);
    _Test.KarmaConfig = KarmaConfig;

    var Results = (function (_super) {
        __extends(Results, _super);
        function Results() {
            _super.call(this);
        }
        Results.prototype.toXml = function (parentElement) {
            var element = xmlbuilder.create('TestResults', { version: '1.0', encoding: 'UTF-8', standalone: true }, { pubID: null, sysID: null }, {
                allowSurrogateChars: false, skipNullAttributes: true,
                headless: false, ignoreDecorators: false, stringify: {}
            });

            this.children.forEach(function (child) {
                child.toXml(element);
            });
            return element.end({ pretty: true });
        };
        return Results;
    })(Item);
    _Test.Results = Results;

    var File = (function (_super) {
        __extends(File, _super);
        function File(path) {
            _super.call(this);
            this.path = path;
            this.path = Util.resolvePath(this.path);
        }
        File.prototype.toXml = function (parentElement) {
            var element = parentElement.ele('File', {
                Path: this.path
            });
            this.children.forEach(function (child) {
                child.toXml(element);
            });
            return element;
        };
        return File;
    })(Item);
    _Test.File = File;

    var Suite = (function (_super) {
        __extends(Suite, _super);
        function Suite(name) {
            _super.call(this);
            this.name = name;
        }
        Suite.prototype.toXml = function (parentElement) {
            var attributes = {
                Name: this.name,
                Framework: this.framework
            };

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
        };
        return Suite;
    })(Item);
    _Test.Suite = Suite;

    var Test = (function (_super) {
        __extends(Test, _super);
        function Test(name) {
            _super.call(this);
            this.name = name;
            this.log = [];
        }
        Test.prototype.toXml = function (parentElement) {
            var attributes = {
                Name: this.name,
                Framework: this.framework,
                Id: this.id,
                Browser: this.browser,
                Time: this.time,
                outcome: this.outcome !== undefined ? Outcome[this.outcome] : undefined
            };

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
        };
        return Test;
    })(Item);
    _Test.Test = Test;

    function SourceToXml(parentElement, source) {
        if (source) {
            return parentElement.ele('Source', {
                Path: source.source,
                Line: source.line,
                Column: source.column
            });
        }
    }
})(Test || (Test = {}));

module.exports = Test;
//# sourceMappingURL=Test.js.map
