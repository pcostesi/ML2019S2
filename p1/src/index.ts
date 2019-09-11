import exercise1 from "./exercise1";
import exercise2 from "./exercise2";
import exercise3 from "./exercise3";

async function main() {
    await exercise1();
    await exercise2();
    await exercise3("La oposición apura la ley de emergencia alimentaria y habrá una sesión especial");
}

main().then(() => { }, (err) => console.error(err));
