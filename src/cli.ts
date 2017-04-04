#!/usr/bin/env node
import Arguments from "./arguments";
import GlobsUglifyJs from "./main";

new GlobsUglifyJs(Arguments.pattern, Arguments.options || {});
