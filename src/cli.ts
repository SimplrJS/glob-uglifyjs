#!/usr/bin/env node
import Arguments from "./arguments";
import { GlobsUglifyJs } from "./main";

async function CliStarter() {
    if (Arguments.uglifyProcessLimit <= 0) {
        throw new Error("Uglify process limit must be at least 1.");
    }

    const globUglifier = new GlobsUglifyJs(Arguments.pattern, Arguments.options || {});
    await globUglifier.Uglify(Arguments.uglifyProcessLimit);
}

CliStarter();
