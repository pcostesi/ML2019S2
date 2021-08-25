import consola from "consola";
import exercise1 from "./exercise1";
import exercise2 from "./exercise2";
import exercise3 from "./exercise3";

async function main() {
    const ex1 = await exercise1();
    consola.log(`Ejercicio 1: probabilidades entre estudiantes y graduados`);
    consola.log(ex1.toString());

    const ex2 = await exercise2();
    consola.log(`Ejercicio 2: Clasificación entre Ingleses y Escoceses`);
    consola.log(ex2.toString());

    await exercise3("La oposición apura la ley de emergencia alimentaria y habrá una sesión especial");
}

main().then(() => {
    consola.info(`Done`);
}, (err) => consola.error(err));
