import * as uglifyjs from "uglify-js";
import * as globby from "globby";
import { IOptions } from "glob";
import * as path from "path";
import { Options, OptionsDto } from "./options";
import * as fs from "fs-extra";
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
        } else if (!this.options.Silence) {
            console.log(`Using custom '${globExt}' extension.`);
        }

        if (this.options.Exclude !== undefined) {
            this.globOptions = { ignore: this.options.Exclude };
        }

        this.globPattern = path.join(this.options.RootDir, globPattern);
    }

    private globOptions: IOptions | undefined;

    private globPattern: string;

    private options: Options;

    private filesList: string[] | undefined;

    private filesDetails: Array<{ Index: number; Status: Status }> | undefined;

    private uglified: boolean = false;

    public async GetFilesList(): Promise<string[]> {
        if (this.filesList != null) {
            return this.filesList;
        }
        let filesList: string[];
        try {
            filesList = await globby(this.globPattern, this.globOptions);
        } catch (error) {
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
    }

    public async Uglify(processLimit: number = 3): Promise<void> {
        if (this.uglified && !this.options.Silence) {
            console.warn("Files already uglified.");
            return;
        }
        let filesList: string[];
        if (this.filesList == null) {
            filesList = await this.GetFilesList();
        } else {
            filesList = this.filesList;
        }

        if (filesList.length === 0 && !this.options.Silence) {
            console.warn(`No files found matching specified glob pattern (${this.globPattern}).`);
            return;
        }

        await this.handleStarter(processLimit);

        const results = {
            Success: this.filesDetails!.filter(x => x.Status === Status.Completed).map(x => filesList[x.Index]),
            Failed: this.filesDetails!.filter(x => x.Status === Status.Failed).map(x => filesList[x.Index])
        };

        if (this.options.RemoveSource) {
            try {
                await this.removeSources(results.Success);
            } catch (error) {
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
    }

    private handlerInfo: {
        Resolve: () => void;
        Reject: () => void;
        ProcessLimit: number;
        ActiveProcess: number;
    };

    private handleStarter(processLimit: number) {
        return new Promise<void>((resolve, reject) => {
            this.handlerInfo = {
                Reject: reject,
                Resolve: resolve,
                ProcessLimit: processLimit,
                ActiveProcess: 0
            };
            this.tryToStartHandle();
        });
    }

    private tryToStartHandle() {
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

    private onFileHandled() {
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

    private async startHandlingFile(index: number) {
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
            await this.uglifyItem(file);
            this.filesDetails[index].Status = Status.Completed;
        } catch (error) {
            this.filesDetails[index].Status = Status.Failed;
            this.handleError(error);
        }

        this.onFileHandled();
    }


    private handleError(error: any) {
        if (!this.options.Silence) {
            if (error instanceof RejectionError) {
                error.LogError(this.options.Debug);
            } else if (this.options.Debug && !this.options.Silence) {
                console.error(error);
            }
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
        return new Promise<uglifyjs.MinifyOutput>(async (resolve, reject) => {
            try {
                const inputData = await fs.readFile(file, "UTF-8");
                const outputData = uglifyjs.minify(inputData, options);
                resolve(outputData);
            } catch (error) {
                reject(error);
            }
        });
    }
}
