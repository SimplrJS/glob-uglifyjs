#!/usr/bin/env node
import Arguments from "./arguments";
import { GlobsUglifyJs } from "./main";

async function CliStarter() {
    const globUglifier = new GlobsUglifyJs(Arguments.pattern, Arguments.options || {});
    await globUglifier.Uglify(5);
}

CliStarter();
