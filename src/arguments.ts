import * as yargs from "yargs";
import { Options } from "./options";

export interface Arguments {
    pattern: string;
    options: Options;
}


function GetVersion() {
    let packageJson = require("../package.json");
    return packageJson.version || "";
}

export default yargs
    .help("h", "Show help")
    .alias("h", "help")
    .version(() => {
        return `Current version: ${GetVersion()}`;
    })
    .alias("v", "version")
    .option("p", {
        alias: "pattern",
        describe: "Files glob pattern",
        type: "string"
    })
    .require("pattern", "Pattern required")
    .config("config")
    .alias("c", "config")
    .default("config", "glob-uglifyjs.config.json")
    .usage("Usage: glob-uglifyjs [options]")
    .argv as Arguments;
