#!/usr/bin/env node
import Arguments from "./arguments";
import { GlobsUglifyJs } from "./main";

import * as process from "process";

console.log(process.cwd());


async function CliStarter() {
    // const start = process.hrtime();
    const globUglifier = new GlobsUglifyJs(Arguments.pattern, Arguments.options || {});
    await globUglifier.Uglify();
    // const [sec, nano] = process.hrtime(start);
    // console.log(`TIME: ${(sec * 1e9 + nano) / 1e9}`);
}

CliStarter();

