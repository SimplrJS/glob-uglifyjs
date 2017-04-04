#!/usr/bin/env node
Object.defineProperty(exports, "__esModule", { value: true });
const arguments_1 = require("./arguments");
const main_1 = require("./main");
new main_1.GlobsUglifyJs(arguments_1.default.pattern, arguments_1.default.options || {});
