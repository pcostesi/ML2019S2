"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const consola_1 = __importDefault(require("consola"));
const exercise1_1 = __importDefault(require("./exercise1"));
const exercise2_1 = __importDefault(require("./exercise2"));
const exercise3_1 = __importDefault(require("./exercise3"));
async function main() {
    const ex1 = await exercise1_1.default();
    consola_1.default.log(`Ejercicio 1: probabilidades entre jóvenes y adultos`);
    consola_1.default.log(ex1.toString());
    const ex2 = await exercise2_1.default();
    consola_1.default.log(`Ejercicio 2: Clasificación entre Ingleses y Escoceses`);
    consola_1.default.log(ex2.toString());
    await exercise3_1.default("La oposición apura la ley de emergencia alimentaria y habrá una sesión especial");
}
main().then(() => {
    consola_1.default.info(`Done`);
}, (err) => consola_1.default.error(err));
//# sourceMappingURL=index.js.map