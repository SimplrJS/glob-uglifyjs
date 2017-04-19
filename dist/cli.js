#!/usr/bin/env node
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const arguments_1 = require("./arguments");
const main_1 = require("./main");
function CliStarter() {
    return __awaiter(this, void 0, void 0, function* () {
        const globUglifier = new main_1.GlobsUglifyJs(arguments_1.default.pattern, arguments_1.default.options || {});
        yield globUglifier.Uglify(5);
    });
}
CliStarter();
