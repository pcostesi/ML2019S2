"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sync_1 = __importDefault(require("csv-parse/lib/sync"));
const fs_1 = __importDefault(require("fs"));
function read(path) {
    const input = fs_1.default.readFileSync(path);
    const records = sync_1.default(input, {
        columns: true,
        delimiter: "\t",
        skip_empty_lines: true,
        quote: false,
    });
    return records;
}
exports.default = read;
