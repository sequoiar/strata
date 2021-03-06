var assert = require("assert"),
    vows = require("vows"),
    path = require("path"),
    fs = require("fs"),
    EventEmitter = require("events").EventEmitter,
    mock = require("./../lib/mock"),
    stat = require("./../lib/static"),
    utils = require("./../lib/utils");

var root = path.join(__dirname, "_files");

vows.describe("static").addBatch({
    "A static middleware": {
        topic: function () {
            return stat(utils.notFound, root, "index.html");
        },
        "when a static file is requested": {
            topic: function (app) {
                this.body = fs.readFileSync(path.join(root, "text"), "utf8");
                mock.request("/text", app, this.callback);
            },
            "should return a 200": function (err, status, headers, body) {
                assert.equal(status, 200);
            },
            "should serve that file": function (err, status, headers, body) {
                assert.equal(body, this.body);
            },
            "should set the correct Content-Type": function (err, status, headers, body) {
                assert.equal(headers["Content-Type"], "text/plain");
            }
        },
        "when a directory is requested": {
            topic: function (app) {
                this.body = fs.readFileSync(path.join(root, "index.html"), "utf8");
                mock.request("/", app, this.callback);
            },
            "should return a 200": function (err, status, headers, body) {
                assert.equal(status, 200);
            },
            "should serve the index file": function (err, status, headers, body) {
                assert.equal(body, this.body);
            },
            "should set the correct Content-Type": function (err, status, headers, body) {
                assert.equal(headers["Content-Type"], "text/html");
            }
        },
        "when a matching file cannot be found": {
            topic: function (app) {
                mock.request("/does-not-exist", app, this.callback);
            },
            "should forward the request to the downstream app": function (err, status, headers, body) {
                assert.equal(status, 404);
            }
        }
    },
    "A static middleware with multiple index files": {
        topic: function () {
            return stat(utils.notFound, root, ["index.htm", "index.html"]);
        },
        "when a directory is requested": {
            topic: function (app) {
                this.body = fs.readFileSync(path.join(root, "index.html"), "utf8");
                mock.request("/", app, this.callback);
            },
            "should return a 200": function (err, status, headers, body) {
                assert.equal(status, 200);
            },
            "should serve the first index file that exists": function (err, status, headers, body) {
                assert.equal(body, this.body);
            },
            "should set the correct Content-Type": function (err, status, headers, body) {
                assert.equal(headers["Content-Type"], "text/html");
            }
        }
    }
}).export(module);
