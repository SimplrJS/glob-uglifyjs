import { OptionsDto } from "./options";
export declare class GlobsUglifyJs {
    constructor(globPattern: string, options?: OptionsDto);
    private globOptions;
    private globPattern;
    private options;
    private filesList;
    private filesDetails;
    GetFilesList(): Promise<string[]>;
    Uglify(porcessLimit?: number): Promise<void>;
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
