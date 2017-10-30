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
const globby = require("globby");
const path = require("path");
const options_1 = require("./options");
const fs = require("fs-extra");
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
        this.uglified = false;
        this.options = new options_1.Options(options);
        const globExt = path.extname(globPattern);
        if (!globExt) {
            globPattern += JS_EXTENSION;
        }
        else if (globExt === ".") {
            globPattern += JS_EXTENSION.slice(1);
        }
        else if (!this.options.Silence) {
            console.log(`Using custom '${globExt}' extension.`);
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
                filesList = yield globby(this.globPattern, this.globOptions);
            }
            catch (error) {
                if (this.options.Debug && !this.options.Silence) {
                    console.error(error);
                }
                throw new Error(`Failed to find files by specified glob '${this.globPattern}'.`);
            }
            if (!this.options.Silence) {
                console.log(`Found ${filesList.length} files with glob pattern '${this.globPattern}'.`);
            }
            this.filesList = filesList;
            this.filesDetails = this.filesList.map((value, index) => {
                return { Index: index, Status: Status.Init };
            });
            return this.filesList;
        });
    }
    Uglify(processLimit = 3) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.uglified && !this.options.Silence) {
                console.warn("Files already uglified.");
                return;
            }
            let filesList;
            if (this.filesList == null) {
                filesList = yield this.GetFilesList();
            }
            else {
                filesList = this.filesList;
            }
            if (filesList.length === 0 && !this.options.Silence) {
                console.warn(`No files found matching specified glob pattern (${this.globPattern}).`);
                return;
            }
            yield this.handleStarter(processLimit);
            const results = {
                Success: this.filesDetails.filter(x => x.Status === Status.Completed).map(x => filesList[x.Index]),
                Failed: this.filesDetails.filter(x => x.Status === Status.Failed).map(x => filesList[x.Index])
            };
            if (this.options.RemoveSource) {
                try {
                    yield this.removeSources(results.Success);
                }
                catch (error) {
                    this.handleError(error);
                }
            }
            if (!this.options.Silence) {
                if (results.Failed.length > 0) {
                    console.warn(`Failed to minify ${results.Failed.length} file${(results.Failed.length > 1) ? "s" : ""}.`);
                }
                if (results.Success.length > 0) {
                    console.log(`Successfully minified ${results.Success.length} file${(results.Success.length > 1) ? "s" : ""}.`);
                }
            }
        });
    }
    handleStarter(processLimit) {
        return new Promise((resolve, reject) => {
            this.handlerInfo = {
                Reject: reject,
                Resolve: resolve,
                ProcessLimit: processLimit,
                ActiveProcess: 0
            };
            this.tryToStartHandle();
        });
    }
    tryToStartHandle() {
        if (this.handlerInfo.ActiveProcess >= this.handlerInfo.ProcessLimit) {
            return;
        }
        if (this.filesDetails == null) {
            return;
        }
        const index = this.filesDetails.findIndex(x => x.Status === Status.Init);
        if (index === -1) {
            return;
        }
        this.handlerInfo.ActiveProcess++;
        this.startHandlingFile(index);
        this.tryToStartHandle();
    }
    onFileHandled() {
        this.handlerInfo.ActiveProcess--;
        if (this.filesDetails == null) {
            return;
        }
        const completedList = this.filesDetails.filter(x => x.Status === Status.Completed || x.Status === Status.Failed);
        if (completedList.length !== this.filesDetails.length) {
            this.tryToStartHandle();
            return;
        }
        this.uglified = true;
        this.handlerInfo.Resolve();
    }
    startHandlingFile(index) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.filesDetails == null || this.filesList == null) {
                this.onFileHandled();
                return;
            }
            const file = this.filesList[this.filesDetails[index].Index];
            if (file == null) {
                this.onFileHandled();
                return;
            }
            try {
                this.filesDetails[index].Status = Status.Pending;
                yield this.uglifyItem(file);
                this.filesDetails[index].Status = Status.Completed;
            }
            catch (error) {
                this.filesDetails[index].Status = Status.Failed;
                this.handleError(error);
            }
            this.onFileHandled();
        });
    }
    handleError(error) {
        if (!this.options.Silence) {
            if (error instanceof rejection_error_1.RejectionError) {
                error.LogError(this.options.Debug);
            }
            else if (this.options.Debug && !this.options.Silence) {
                console.error(error);
            }
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
                if (outputData.error != null) {
                    throw outputData.error;
                }
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
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const inputData = yield fs.readFile(file, "UTF-8");
                    const outputData = uglifyjs.minify(inputData, options);
                    resolve(outputData);
                }
                catch (error) {
                    reject(error);
                }
            }));
        });
    }
}
exports.GlobsUglifyJs = GlobsUglifyJs;
