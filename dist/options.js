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
            Exclude: undefined,
            Silence: false
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
                    // Deprecated: now use Exclude key.
                    if (key === "exclude") {
                        this.options["Exclude"] = importData[key];
                    }
                    else {
                        this.options[key] = importData[key];
                    }
                }
            });
        }
    }
    ToObject() {
        return this.options;
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
        return this.options.Exclude;
    }
    get Silence() {
        return this.options.Silence;
    }
}
exports.Options = Options;
