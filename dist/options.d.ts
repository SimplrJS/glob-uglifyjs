/// <reference types="uglify-js" />
import * as uglifyjs from 'uglify-js';
export interface Options {
    [key: string]: any;
    UseMinExt?: boolean;
    MinifyOptions?: uglifyjs.MinifyOptions;
    OutDir?: string;
    Cwd?: string;
    RootDir?: string;
    RemoveSource?: boolean;
    Debug?: boolean;
    exclude?: Array<string>;
}
export default class OptionsConstructor implements Options {
    constructor(importData?: Options);
    private options;
    readonly UseMinExt: boolean;
    readonly MinifyOptions: uglifyjs.MinifyOptions;
    readonly OutDir: string;
    readonly Cwd: string;
    readonly RootDir: string;
    readonly RemoveSource: boolean;
    readonly Debug: boolean;
    readonly Exclue: Array<string> | undefined;
}
