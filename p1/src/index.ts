import consola from "consola";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
// import exercise1 from "./exercise1";
import exercise2 from "./exercise2";
import exercise3 from "./exercise3";

function replacer(key, value) {
    if (value instanceof Map) {
        return Object.fromEntries(value.entries())
    } else {
        return value;
    }
}


async function main() {
    // const ex1 = await exercise1();
    // consola.log(`Ejercicio 1: probabilidades entre estudiantes y graduados`);
    // consola.log(ex1.toString());

    const ex2 = await exercise2();
    consola.log(`Ejercicio 2: Clasificación entre Ingleses y Escoceses`);
    consola.log(ex2.toString());

    const ex3 = await exercise3();
    consola.log(`Ejercicio 3: Palabras`)
    consola.log(ex3)
    writeFileSync('ex3-stats.json', JSON.stringify(Object.fromEntries(ex3.stats), replacer, 2))
    writeFileSync('ex3-roc.json', JSON.stringify(Object.fromEntries(ex3.roc.entries()), replacer, 2))
    writeFileSync('ex3-confusion.json', JSON.stringify(Object.fromEntries(ex3.matrix.table), replacer, 2))
}

main().then(() => {
    consola.info(`Done`);
}, (err) => consola.error(err));
