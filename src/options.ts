import * as uglifyjs from "uglify-js";
import * as process from "process";

export interface OptionsDto {
    [key: string]: any;
    UseMinExt?: boolean;
    MinifyOptions?: uglifyjs.MinifyOptions;
    OutDir?: string;
    Cwd?: string;
    RootDir?: string;
    RemoveSource?: boolean;
    Debug?: boolean;
    Exclude?: Array<string> | string;
    Silence?: boolean;
}


export class Options implements OptionsDto {

    constructor(importData?: OptionsDto) {
        if (importData != null) {
            if (importData.Cwd != null) {
                if (importData.Cwd.length > 0) {
                    process.chdir(importData.Cwd);
                }
                delete importData.Cwd;
            }
            this.options.Cwd = process.cwd();

            Object.keys(this.options).forEach(key => {
                if (importData[key] !== undefined) {
                    // Deprecated: now use Exclude key.
                    if (key === "exclude") {
                        this.options["Exclude"] = importData[key];
                    } else {
                        this.options[key] = importData[key];
                    }
                }
            });
        }
    }

    private options: OptionsDto = {
        MinifyOptions: {},
        UseMinExt: true,
        OutDir: "",
        Cwd: undefined,
        RootDir: "",
        RemoveSource: false,
        Debug: false,
        Exclude: undefined,
        Silence: false
    };

    public ToObject(): OptionsDto {
        return this.options;
    }

    public get UseMinExt(): boolean {
        return this.options.UseMinExt!;
    }

    public get MinifyOptions(): uglifyjs.MinifyOptions {
        return this.options.MinifyOptions!;
    }

    public get OutDir(): string {
        return this.options.OutDir!;
    }

    public get Cwd(): string {
        return this.options.Cwd!;
    }

    public get RootDir(): string {
        return this.options.RootDir!;
    }

    public get RemoveSource(): boolean {
        return this.options.RemoveSource!;
    }

    public get Debug(): boolean {
        return this.options.Debug!;
    }

    public get Exclude(): Array<string> | string | undefined {
        return this.options.Exclude;
    }

    public get Silence(): boolean {
        return this.options.Silence!;
    }

}
