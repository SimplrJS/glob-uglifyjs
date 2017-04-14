import * as path from "path";
import * as fs from "fs-promise";
import * as mkdirp from "mkdirp";

export async function Exists(path: string) {
    try {
        const stat = await fs.stat(path);
        return stat.isDirectory();
    } catch (error) {
        return false;
    }
}

export async function RemoveEmptyDirectories(directoryPath: string) {
    const isExist = await Exists(directoryPath);
    if (!isExist) {
        return;
    }
    let files = await fs.readdir(directoryPath);
    if (files.length > 0) {
        for (const file of files) {
            const fullPath = path.join(directoryPath, file);
            await RemoveEmptyDirectories(fullPath);
        }
        files = await fs.readdir(directoryPath);
    }
    if (files.length === 0) {
        await fs.rmdir(directoryPath);
    }
}

export async function MakeTree(filePath: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const dirname = path.dirname(filePath);
        mkdirp(dirname, (error, data) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(data);
        });
    });
}
