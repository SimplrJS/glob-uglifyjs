import * as path from "path";
import * as fs from "fs-extra";

export async function RemoveEmptyDirectories(directoryPath: string) {
    const stat = await fs.stat(directoryPath);
    if (!stat.isDirectory()) {
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
    const dirname = path.dirname(filePath);
    await fs.ensureDir(dirname);
    return dirname;
}
