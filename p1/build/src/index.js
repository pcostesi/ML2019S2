"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const exercise1_1 = __importDefault(require("./exercise1"));
const exercise2_1 = __importDefault(require("./exercise2"));
const exercise3_1 = __importDefault(require("./exercise3"));
async function main() {
    await exercise1_1.default();
    await exercise2_1.default();
    await exercise3_1.default();
}
main().then(() => { }, (err) => console.error(err));
