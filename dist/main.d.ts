import { Options } from "./options";
export declare class GlobsUglifyJs {
    private globPattern;
    private options;
    constructor(globPattern: string, options?: Options);
    private main();
    private deleteFiles(fileList);
    private deleteFile(filePath);
    private uglifyFile(file, options?);
    private startRecursiveUglify(filesList, results?);
    private recursiveUglify(file);
    private ensureDirectoryExistence(filePath);
    private directoryExists(path);
    private deleteEmptyDirectories(directoryPath);
    private removeDirectory(directoryPath);
    private readFilesInDirectory(directoryPath);
    /**
     * Check if parsed name without extension has minified extension prefix.
     *
     * @private
     * @param {string} nameWithoutExt Parsed file name without extension.
     * @returns
     *
     * @memberOf GlobsUglifyJs
     */
    private hasMinifiedExt(nameWithoutExt);
    private resolveOutFilePath(filePath);
    /**
     * Asynchronously write data to file with flag "wx".
     *
     * @private
     * @param {string} filePath File path.
     * @param {string} data Data in "utf-8".
     * @returns
     *
     * @memberOf GlobsUglifyJs
     */
    private writeToFile(filePath, data);
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
    private getGlobs(pattern, options?);
    /**
     * Validate JS extension.
     *
     * @private
     * @param {string} pattern
     * @returns {boolean} True if extension exist.
     *
     * @memberOf GlobsUglifyJs
     */
    private validateExtension(pattern);
    /**
     * Add .js to glob pattern.
     *
     * @private
     * @param {string} pattern
     * @returns {string}
     *
     * @memberOf GlobsUglifyJs
     */
    private addJsExtension(pattern);
}
