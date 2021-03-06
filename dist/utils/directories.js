var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs-extra");
function RemoveEmptyDirectories(directoryPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const stat = yield fs.stat(directoryPath);
        if (!stat.isDirectory()) {
            return;
        }
        let files = yield fs.readdir(directoryPath);
        if (files.length > 0) {
            for (const file of files) {
                const fullPath = path.join(directoryPath, file);
                yield RemoveEmptyDirectories(fullPath);
            }
            files = yield fs.readdir(directoryPath);
        }
        if (files.length === 0) {
            yield fs.rmdir(directoryPath);
        }
    });
}
exports.RemoveEmptyDirectories = RemoveEmptyDirectories;
function MakeTree(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const dirname = path.dirname(filePath);
        yield fs.ensureDir(dirname);
        return dirname;
    });
}
exports.MakeTree = MakeTree;
