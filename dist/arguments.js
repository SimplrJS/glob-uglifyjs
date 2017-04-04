const yargs = require('yargs');
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = yargs
    .help('h', 'Show help')
    .alias('h', 'help')
    .version(() => {
    return `Current version: ${require('../package.json').version}`;
})
    .alias('v', 'version')
    .option("p", {
    alias: "pattern",
    describe: "Files glob pattern",
    type: "string"
})
    .require("pattern", "Pattern required")
    .config('config')
    .alias('c', 'config')
    .default('config', 'glob-uglifyjs.config.json')
    .usage('Usage: glob-uglifyjs [options]')
    .argv;