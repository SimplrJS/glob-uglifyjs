import { OptionsDto } from "./options";
export declare class GlobsUglifyJs {
    constructor(globPattern: string, options?: OptionsDto);
    private globOptions;
    private globPattern;
    private options;
    private filesList;
    private filesDetails;
    private uglified;
    GetFilesList(): Promise<string[]>;
    Uglify(processLimit?: number): Promise<void>;
    private handlerInfo;
    private handleStarter(processLimit);
    private tryToStartHandle();
    private onFileHandled();
    private startHandlingFile(index);
    private handleError(error);
    private removeSources(successFiles);
    private uglifyItem(file);
    private buildOutFilePath(filePath);
    private uglifyFile(file, options?);
    /**
     * Asynchronously return files list by pattern.
     *
     * @param {string} pattern
     * @param {glob.IOptions} [options={}]
     */
    private getGlobFilesList(pattern, options?);
}
