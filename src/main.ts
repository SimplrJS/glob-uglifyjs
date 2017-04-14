import * as uglifyjs from "uglify-js";
import * as glob from "glob";
import * as path from "path";
import { Options, OptionsDto } from "./options";
import * as fs from "fs-promise";
import { RejectionError } from "./rejection-error";

import * as Directories from "./utils/directories";

const JS_EXTENSION = ".js";
const MINIFY_EXTENSION_PREFIX = ".min";

enum Status {
    Init,
    Pending,
    Completed,
    Failed
}

export class GlobsUglifyJs {

    constructor(globPattern: string, options?: OptionsDto) {
        this.options = new Options(options);
        const globExt = path.extname(globPattern);
        if (!globExt) {
            globPattern += JS_EXTENSION;
        } else if (globExt === ".") {
            globPattern += JS_EXTENSION.slice(1);
        } else {
            console.log("Using custom extension: ", globExt);
        }

        if (this.options.Exclude !== undefined) {
            this.globOptions = { ignore: this.options.Exclude };
        }

        this.globPattern = path.join(this.options.RootDir, globPattern);
    }

    private globOptions: glob.IOptions | undefined;

    private globPattern: string;

    private options: Options;

    private filesList: string[] | undefined;

    private filesDetails: Array<{ Index: number; Status: Status }> | undefined;

    public async GetFilesList(): Promise<string[]> {
        if (this.filesList != null) {
            return this.filesList;
        }
        let filesList: string[];
        try {
            filesList = await this.getGlobFilesList(this.globPattern, this.globOptions);
        } catch (error) {
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
    }

    public async Uglify(porcessLimit: number = 3): Promise<void> {
        let filesList: string[];
        if (this.filesList == null) {
            filesList = await this.GetFilesList();
        } else {
            filesList = this.filesList;
        }

        const filesCount = filesList.length;

        if (filesCount === 0) {
            console.warn(`No files found matching specified glob pattern (${this.globPattern}).`);
            return;
        }

        const results = {
            Success: new Array<string>(),
            Failed: new Array<string>()
        };

        for (let i = 0; i < filesCount; i++) {
            const file = filesList[i];
            try {
                await this.uglifyItem(file);
                results.Success.push(file);
            } catch (error) {
                results.Failed.push(file);
                this.handleError(error);
            }
        }

        if (this.options.RemoveSource) {
            try {
                await this.removeSources(results.Success);
            } catch (error) {
                this.handleError(error);
            }
        }

        if (results.Failed.length > 0) {
            console.warn(`Failed to minify ${results.Failed.length} file${(results.Failed.length > 1) ? "s" : ""}.`);
        }
        if (results.Success.length > 0) {
            console.log(`Successfully minified ${results.Success.length} file${(results.Success.length > 1) ? "s" : ""}.`);
        }
    }

    private handleError(error: any) {
        if (error instanceof RejectionError) {
            error.LogError(this.options.Debug);
        } else if (this.options.Debug) {
            console.error(error);
        }
    }

    private async removeSources(successFiles: string[]) {
        for (const file of successFiles) {
            try {
                await fs.unlink(file);
            } catch (error) {
                throw new RejectionError(error, "deleteFile");
            }
        }
        try {
            await Directories.RemoveEmptyDirectories(this.options.RootDir);
        } catch (error) {
            throw new RejectionError(error, "deleteEmptyDirectories");
        }
    }


    private async uglifyItem(file: string): Promise<void> {
        let outputData: uglifyjs.MinifyOutput;
        try {
            outputData = await this.uglifyFile(file, this.options.MinifyOptions)
        } catch (error) {
            throw new RejectionError(error, "uglifyFile", file);
        }

        const outPath = this.buildOutFilePath(file);

        try {
            await Directories.MakeTree(outPath);
        } catch (error) {
            throw new RejectionError(error, "ensureDirectoryExistence", file);
        }

        try {
            await fs.writeFile(outPath, outputData.code, { encoding: "utf-8", flag: "w" });
        } catch (error) {
            throw new RejectionError(error, "writeToFile", file);
        }
    }

    private buildOutFilePath(filePath: string): string {
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

    private async uglifyFile(file: string, options?: uglifyjs.MinifyOptions): Promise<uglifyjs.MinifyOutput> {
        return new Promise<uglifyjs.MinifyOutput>((resolve, reject) => {
            try {
                let outputData = uglifyjs.minify(file, options);
                resolve(outputData);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Asynchronously return files list by pattern.
     * 
     * @param {string} pattern
     * @param {glob.IOptions} [options={}]
     */
    private async getGlobFilesList(pattern: string, options: glob.IOptions = {}): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            glob(pattern, options, (err, matches) => {
                if (err != null) {
                    reject(err);
                } else {
                    resolve(matches);
                }
            });
        });
    }
}
