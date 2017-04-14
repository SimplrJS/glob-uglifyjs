var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const uglifyjs = require("uglify-js");
const glob = require("glob");
const path = require("path");
const options_1 = require("./options");
const fs = require("fs-promise");
const rejection_error_1 = require("./rejection-error");
const Directories = require("./utils/directories");
const JS_EXTENSION = ".js";
const MINIFY_EXTENSION_PREFIX = ".min";
var Status;
(function (Status) {
    Status[Status["Init"] = 0] = "Init";
    Status[Status["Pending"] = 1] = "Pending";
    Status[Status["Completed"] = 2] = "Completed";
    Status[Status["Failed"] = 3] = "Failed";
})(Status || (Status = {}));
class GlobsUglifyJs {
    constructor(globPattern, options) {
        this.options = new options_1.Options(options);
        const globExt = path.extname(globPattern);
        if (!globExt) {
            globPattern += JS_EXTENSION;
        }
        else if (globExt === ".") {
            globPattern += JS_EXTENSION.slice(1);
        }
        else {
            console.log("Using custom extension: ", globExt);
        }
        if (this.options.Exclude !== undefined) {
            this.globOptions = { ignore: this.options.Exclude };
        }
        this.globPattern = path.join(this.options.RootDir, globPattern);
    }
    GetFilesList() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.filesList != null) {
                return this.filesList;
            }
            let filesList;
            try {
                filesList = yield this.getGlobFilesList(this.globPattern, this.globOptions);
            }
            catch (error) {
                if (this.options.Debug) {
                    console.error(error);
                }
                throw new Error(`Failed to find files by specified glob (${this.globPattern}).`);
            }
            console.log(`Found ${filesList.length} files with glob pattern ${this.globPattern}`);
            this.filesList = filesList;
            this.filesDetails = this.filesList.map((value, index) => {
                return { Index: index, Status: Status.Init };
            });
            return this.filesList;
        });
    }
    Uglify(porcessLimit = 3) {
        return __awaiter(this, void 0, void 0, function* () {
            let filesList;
            if (this.filesList == null) {
                filesList = yield this.GetFilesList();
            }
            else {
                filesList = this.filesList;
            }
            const filesCount = filesList.length;
            if (filesCount === 0) {
                console.warn(`No files found matching specified glob pattern (${this.globPattern}).`);
                return;
            }
            const results = {
                Success: new Array(),
                Failed: new Array()
            };
            for (let i = 0; i < filesCount; i++) {
                const file = filesList[i];
                try {
                    yield this.uglifyItem(file);
                    results.Success.push(file);
                }
                catch (error) {
                    results.Failed.push(file);
                    this.handleError(error);
                }
            }
            if (this.options.RemoveSource) {
                try {
                    yield this.removeSources(results.Success);
                }
                catch (error) {
                    this.handleError(error);
                }
            }
            if (results.Failed.length > 0) {
                console.warn(`Failed to minify ${results.Failed.length} file${(results.Failed.length > 1) ? "s" : ""}.`);
            }
            if (results.Success.length > 0) {
                console.log(`Successfully minified ${results.Success.length} file${(results.Success.length > 1) ? "s" : ""}.`);
            }
        });
    }
    handleError(error) {
        if (error instanceof rejection_error_1.RejectionError) {
            error.LogError(this.options.Debug);
        }
        else if (this.options.Debug) {
            console.error(error);
        }
    }
    removeSources(successFiles) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const file of successFiles) {
                try {
                    yield fs.unlink(file);
                }
                catch (error) {
                    throw new rejection_error_1.RejectionError(error, "deleteFile");
                }
            }
            try {
                yield Directories.RemoveEmptyDirectories(this.options.RootDir);
            }
            catch (error) {
                throw new rejection_error_1.RejectionError(error, "deleteEmptyDirectories");
            }
        });
    }
    uglifyItem(file) {
        return __awaiter(this, void 0, void 0, function* () {
            let outputData;
            try {
                outputData = yield this.uglifyFile(file, this.options.MinifyOptions);
            }
            catch (error) {
                throw new rejection_error_1.RejectionError(error, "uglifyFile", file);
            }
            const outPath = this.buildOutFilePath(file);
            try {
                yield Directories.MakeTree(outPath);
            }
            catch (error) {
                throw new rejection_error_1.RejectionError(error, "ensureDirectoryExistence", file);
            }
            try {
                yield fs.writeFile(outPath, outputData.code, { encoding: "utf-8", flag: "w" });
            }
            catch (error) {
                throw new rejection_error_1.RejectionError(error, "writeToFile", file);
            }
        });
    }
    buildOutFilePath(filePath) {
        const parsedPath = path.parse(filePath);
        let targetExt = parsedPath.ext;
        if (this.options.UseMinExt && targetExt !== MINIFY_EXTENSION_PREFIX) {
            targetExt = MINIFY_EXTENSION_PREFIX + targetExt;
        }
        let relativeDir = path.relative(this.options.RootDir, parsedPath.dir);
        return path.format({
            ext: targetExt,
            name: parsedPath.name,
            dir: path.resolve(this.options.OutDir, relativeDir),
            base: parsedPath.name + targetExt,
            root: parsedPath.root
        });
    }
    uglifyFile(file, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                try {
                    let outputData = uglifyjs.minify(file, options);
                    resolve(outputData);
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
    /**
     * Asynchronously return files list by pattern.
     *
     * @param {string} pattern
     * @param {glob.IOptions} [options={}]
     */
    getGlobFilesList(pattern, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                glob(pattern, options, (err, matches) => {
                    if (err != null) {
                        reject(err);
                    }
                    else {
                        resolve(matches);
                    }
                });
            });
        });
    }
}
exports.GlobsUglifyJs = GlobsUglifyJs;
