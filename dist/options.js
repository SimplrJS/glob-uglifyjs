Object.defineProperty(exports, "__esModule", { value: true });
const process = require("process");
class Options {
    constructor(importData) {
        this.options = {
            MinifyOptions: {},
            UseMinExt: true,
            OutDir: "",
            Cwd: undefined,
            RootDir: "",
            RemoveSource: false,
            Debug: false,
            exclude: undefined
        };
        if (importData != null) {
            if (importData.Cwd != null) {
                if (importData.Cwd.length > 0) {
                    process.chdir(importData.Cwd);
                }
                delete importData.Cwd;
            }
            this.options.Cwd = process.cwd();
            Object.keys(this.options).forEach(key => {
                if (importData[key] !== undefined) {
                    this.options[key] = importData[key];
                }
            });
        }
    }
    get UseMinExt() {
        return this.options.UseMinExt;
    }
    get MinifyOptions() {
        return this.options.MinifyOptions;
    }
    get OutDir() {
        return this.options.OutDir;
    }
    get Cwd() {
        return this.options.Cwd;
    }
    get RootDir() {
        return this.options.RootDir;
    }
    get RemoveSource() {
        return this.options.RemoveSource;
    }
    get Debug() {
        return this.options.Debug;
    }
    get Exclude() {
        return this.options.exclude;
    }
}
exports.Options = Options;
