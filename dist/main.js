var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const uglifyjs = require('uglify-js');
const glob = require('glob');
const path = require('path');
const options_1 = require('./options');
const fs = require('fs');
const rejection_error_1 = require('./rejection-error');
const JS_EXTENSION = ".js";
const MINIFY_EXTENSION_PREFIX = ".min";
class RecursiveUglifyResults {
    constructor() {
        this.succeed = 0;
        this.failed = 0;
    }
    get Succeed() {
        return this.succeed;
    }
    get Failed() {
        return this.failed;
    }
    OnSucceed() {
        this.succeed++;
    }
    OnFailed() {
        this.failed++;
    }
}
class GlobsUglifyJs {
    constructor(globPattern, options) {
        this.options = new options_1.default(options);
        if (!this.validateExtension(globPattern)) {
            globPattern = this.addJsExtension(globPattern);
        }
        this.globPattern = path.join(this.options.RootDir, globPattern);
        this.main();
    }
    main() {
        return __awaiter(this, void 0, void 0, function* () {
            let globOptions;
            if (this.options.Exclue !== undefined) {
                globOptions = { ignore: this.options.Exclue };
            }
            try {
                let filesList = yield this.getGlobs(this.globPattern, globOptions);
                if (filesList.length === 0) {
                    console.log("No files found.");
                    return;
                }
                let results = yield this.startRecursiveUglify(filesList.slice(0));
                if (this.options.RemoveSource) {
                    yield this.deleteFiles(filesList.slice(0));
                    yield this.deleteEmptyDirectories(this.options.RootDir);
                }
                if (results.Failed > 0) {
                    console.warn(`Failed to minify ${results.Failed} file${(results.Failed > 1) ? "s" : ""}.`);
                }
                if (results.Succeed > 0) {
                    console.log(`Successfully minified ${results.Succeed} file${(results.Succeed > 1) ? "s" : ""}.`);
                }
            }
            catch (error) {
                if (error instanceof rejection_error_1.default) {
                    error.ThrowError();
                }
                else {
                    throw error;
                }
            }
        });
    }
    deleteFiles(fileList) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let rejected = false;
                let file = fileList.shift();
                if (file == null) {
                    resolve();
                    return;
                }
                yield this.deleteFile(file)
                    .catch(error => {
                    rejected = true;
                    reject(new rejection_error_1.default(error, "deleteFile"));
                });
                if (!rejected) {
                    yield this.deleteFiles(fileList);
                    resolve();
                }
            }));
        });
    }
    deleteFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fs.unlink(filePath, error => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    }
    uglifyFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                try {
                    let outputData = uglifyjs.minify(file);
                    resolve(outputData);
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
    startRecursiveUglify(filesList, results) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                if (results == null) {
                    results = new RecursiveUglifyResults();
                }
                let file = filesList.shift();
                if (file != null) {
                    try {
                        yield this.recursiveUglify(file);
                        results.OnSucceed();
                    }
                    catch (error) {
                        if (error instanceof rejection_error_1.default) {
                            error.LogError(this.options.Debug);
                        }
                        else if (this.options.Debug) {
                            console.error(error);
                        }
                        results.OnFailed();
                    }
                    resolve(yield this.startRecursiveUglify(filesList, results));
                }
                else {
                    resolve(results);
                }
            }));
        });
    }
    recursiveUglify(file) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    let outputData = yield this.uglifyFile(file)
                        .catch(error => {
                        throw new rejection_error_1.default(error, "uglifyFile", file);
                    });
                    let outPath = this.resolveOutFilePath(file);
                    yield this.ensureDirectoryExistence(outPath)
                        .catch(error => {
                        throw new rejection_error_1.default(error, "ensureDirectoryExistence", file);
                    });
                    yield this.writeToFile(outPath, outputData.code)
                        .catch(error => {
                        throw new rejection_error_1.default(error, "writeToFile", file);
                    });
                    resolve();
                }
                catch (error) {
                    reject(error);
                }
            }));
        });
    }
    ensureDirectoryExistence(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let rejected = false;
                let dirname = path.dirname(filePath);
                let directoryExist = yield this.directoryExists(dirname);
                if (directoryExist) {
                    resolve();
                    return;
                }
                yield this.ensureDirectoryExistence(dirname)
                    .catch(error => {
                    reject(error);
                    rejected = true;
                });
                if (rejected) {
                    return;
                }
                fs.mkdir(dirname, error => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve();
                    }
                });
            }));
        });
    }
    directoryExists(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                fs.stat(path, (error, stats) => {
                    if (error) {
                        resolve(false);
                    }
                    else {
                        resolve(stats.isDirectory());
                    }
                });
            });
        });
    }
    deleteEmptyDirectories(directoryPath) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let rejected = false;
                let isExist = yield this.directoryExists(directoryPath);
                if (!isExist) {
                    resolve(); // or reject?
                    return;
                }
                let files = yield this.readFilesInDirectory(directoryPath);
                if (files.length > 0) {
                    for (let i = 0; i < files.length; i++) {
                        let file = files[i];
                        var fullPath = path.join(directoryPath, file);
                        yield this.deleteEmptyDirectories(fullPath)
                            .catch(error => {
                            reject(new rejection_error_1.default(error, "deleteEmptyDirectories"));
                            rejected = true;
                        });
                        if (rejected) {
                            break;
                        }
                    }
                    if (rejected) {
                        return;
                    }
                    files = yield this.readFilesInDirectory(directoryPath);
                }
                if (files.length == 0) {
                    yield this.removeDirectory(directoryPath)
                        .catch(error => {
                        reject(new rejection_error_1.default(error, "removeDirectory"));
                        rejected = true;
                    });
                }
                if (!rejected) {
                    resolve();
                }
            }));
        });
    }
    removeDirectory(directoryPath) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fs.rmdir(directoryPath, error => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    }
    readFilesInDirectory(directoryPath) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fs.readdir(directoryPath, (error, files) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(files);
                    }
                });
            });
        });
    }
    /**
     * Check if parsed name without extension has minified extension prefix.
     *
     * @private
     * @param {string} nameWithoutExt Parsed file name without extension.
     * @returns
     *
     * @memberOf GlobsUglifyJs
     */
    hasMinifiedExt(nameWithoutExt) {
        let ext = path.extname(nameWithoutExt);
        return (ext != null && ext === MINIFY_EXTENSION_PREFIX);
    }
    resolveOutFilePath(filePath) {
        let parsedPath = path.parse(filePath), targetExt = parsedPath.ext;
        if (this.options.UseMinExt && !this.hasMinifiedExt(parsedPath.name)) {
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
    /**
     * Asynchronously write data to file with flag 'wx'.
     *
     * @private
     * @param {string} filePath File path.
     * @param {string} data Data in 'utf-8'.
     * @returns
     *
     * @memberOf GlobsUglifyJs
     */
    writeToFile(filePath, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fs.writeFile(filePath, data, { encoding: "utf-8", flag: "w" }, (error) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    }
    /**
     * Asynchronously return files list by pattern.
     *
     * @private
     * @param {string} pattern
     * @param {glob.IOptions} [options={}]
     * @returns
     *
     * @memberOf GlobsUglifyJs
     */
    getGlobs(pattern, options = {}) {
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
    /**
     * Validate JS extension.
     *
     * @private
     * @param {string} pattern
     * @returns {boolean} True if extension exist.
     *
     * @memberOf GlobsUglifyJs
     */
    validateExtension(pattern) {
        let ext = path.extname(pattern);
        if (ext.length !== 0 && ext !== JS_EXTENSION) {
            console.warn("Using custom extension: ", ext);
        }
        return (ext != null && ext.length > 0);
    }
    /**
     * Add .js to glob pattern.
     *
     * @private
     * @param {string} pattern
     * @returns {string}
     *
     * @memberOf GlobsUglifyJs
     */
    addJsExtension(pattern) {
        return pattern + JS_EXTENSION;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GlobsUglifyJs;
