var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Util = require("./Util");

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
        };
        return Test;
    })(Item);
    _Test.Test = Test;

    function SourceToXml(parentElement, source) {
        if (source) {
            return parentElement.ele('Source', { Path: source.source, Line: source.line, Column: source.column });
        }
    }
})(Test || (Test = {}));

module.exports = Test;
//# sourceMappingURL=Test.js.map
