import * as uglifyjs from 'uglify-js';
import * as glob from 'glob';
import * as path from 'path';
import OptionsConstructor, { Options } from './options';
import * as fs from 'fs';

const JS_EXTENSION = ".js";
const MINIFY_EXTENSION_PREFIX = ".min";


export default class GlobsUglifyJs {

    private globPattern: string;

    private options: OptionsConstructor;

    constructor(globPattern: string, options?: Options) {
        this.options = new OptionsConstructor(options);
        if (!this.validateExtension(globPattern)) {
            globPattern = this.addJsExtension(globPattern);
        }
        this.globPattern = path.join(this.options.RootDir, globPattern);

        this.main();
    }

    private async main() {
        let rejected = false;

        let filesList = await this.getGlobs(this.globPattern);

        if (filesList.length === 0) {
            console.log("No files found.");
            return;
        }

        await this.recursiveUglify(filesList.slice())
            .catch(error => {
                console.log(error);
                rejected = true;
            });

        if (rejected) {
            return;
        }

        if (this.options.RemoveSource) {
            await this.deleteFiles(filesList.slice())
                .catch(error => {
                    console.log(error);
                    rejected = true;
                });

            if (rejected) {
                return;
            }

            await this.deleteEmptyDirectories(this.options.RootDir)
                .catch(error => {
                    console.log(error);
                    rejected = true;
                });

            if (rejected) {
                return;
            }
        }

        console.log(`Successfully minified ${filesList.length} files.`);
    }

    private async deleteFiles(fileList: Array<string>) {
        return new Promise<never>(async (resolve, reject) => {
            let rejected = false;
            let file = fileList.shift();

            if (file == null) {
                resolve();
                return;
            }

            await this.deleteFile(file)
                .catch(error => {
                    rejected = true;
                    reject(error);
                });

            if (!rejected) {
                await this.deleteFiles(fileList);
                resolve();
            }
        });
    }

    private async deleteFile(filePath: string) {
        return new Promise<never>((resolve, reject) => {
            fs.unlink(filePath, error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    private async recursiveUglify(filesList: Array<string>) {
        return new Promise<never>(async (resolve, reject) => {
            let file = filesList.shift();
            if (file != null) {
                let rejected = false;
                let outputData = uglifyjs.minify(file);
                let outPath = this.resolveOutFilePath(file);

                await this.ensureDirectoryExistence(outPath)
                    .catch(error => {
                        rejected = true;
                        reject(error);
                    });

                if (rejected) {
                    return;
                }

                await this.writeToFile(outPath, outputData.code)
                    .catch(error => {
                        rejected = true;
                        reject(error);
                    });

                if (rejected) {
                    return;
                }

                await this.recursiveUglify(filesList)
                    .catch(error => {
                        rejected = true;
                        reject(error);
                    });

                if (rejected) {
                    return;
                }
                resolve();
            } else {
                resolve();
            }
        });
    }

    private async ensureDirectoryExistence(filePath: string) {
        return new Promise<never>(async (resolve, reject) => {
            let dirname = path.dirname(filePath);
            if (await this.directoryExists(dirname)) {
                resolve();
                return;
            }
            await this.ensureDirectoryExistence(dirname);
            fs.mkdir(dirname, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    private async directoryExists(path: string) {
        return new Promise<boolean>(resolve => {
            fs.stat(path, (error, stats) => {
                if (error) {
                    resolve(false);
                } else {
                    resolve(stats.isDirectory());
                }
            });
        });
    }

    private async deleteEmptyDirectories(directoryPath: string) {
        return new Promise(async (resolve, reject) => {
            let rejected = false;
            let isExist = await this.directoryExists(directoryPath);
            if (!isExist) {
                resolve(); // or reject?
                return;
            }

            let files = await this.readFilesInDirectory(directoryPath);

            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    let file = files[i];
                    var fullPath = path.join(directoryPath, file);
                    await this.deleteEmptyDirectories(fullPath).catch(error => {
                        console.log("Error: ", error);
                        reject(error);
                        rejected = true;
                    });
                    if (rejected) {
                        break;
                    }
                }

                if (rejected) {
                    return;
                }

                if (rejected) {
                    return;
                }
                files = await this.readFilesInDirectory(directoryPath);
            }

            if (files.length == 0) {
                await this.removeDirectory(directoryPath)
                    .catch(error => {
                        reject(error);
                        rejected = true;
                    });
            }

            if (!rejected) {
                resolve();
            }

        });
    }

    private async removeDirectory(directoryPath: string) {
        return new Promise<never>((resolve, reject) => {
            fs.rmdir(directoryPath, error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    private async readFilesInDirectory(directoryPath: string) {
        return new Promise<Array<string>>((resolve, reject) => {
            fs.readdir(directoryPath, (error, files) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(files);
                }
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
    private hasMinifiedExt(nameWithoutExt: string) {
        let ext = path.extname(nameWithoutExt);
        return (ext != null && ext === MINIFY_EXTENSION_PREFIX);
    }

    private resolveOutFilePath(filePath: string) {
        let parsedPath = path.parse(filePath),
            targetExt = parsedPath.ext;

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
    private async writeToFile(filePath: string, data: string) {
        return new Promise<never>((resolve, reject) => {
            fs.writeFile(filePath, data, { encoding: "utf-8", flag: "w" }, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
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
    private async getGlobs(pattern: string, options: glob.IOptions = {}) {
        return new Promise<Array<string>>((resolve, reject) => {
            glob(pattern, options, (err, matches) => {
                if (err != null) {
                    reject(err);
                } else {
                    resolve(matches);
                }
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
    private validateExtension(pattern: string): boolean {
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
    private addJsExtension(pattern: string): string {
        return pattern + JS_EXTENSION;
    }

}
