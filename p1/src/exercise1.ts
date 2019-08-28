import { NaiveBayesEngine } from './bayes';

enum Programs {
    PROG1 = 'Programa 1',
    PROG2 = 'Programa 2',
    PROG3 = 'Programa 3',
    PROG4 = 'Programa 4',
}

enum Kinds {
    YOUNG = 'Joven',
    ADULT = 'Viejo',
}

const distribution = {
    [Programs.PROG1]: {
        [Kinds.YOUNG]: 0.95,
        [Kinds.ADULT]: 0.03,
    },
    [Programs.PROG2]: {
        [Kinds.YOUNG]: 0.05,
        [Kinds.ADULT]: 0.82,
    },
    [Programs.PROG3]: {
        [Kinds.YOUNG]: 0.02,
        [Kinds.ADULT]: 0.34,
    },
    [Programs.PROG4]: {
        [Kinds.YOUNG]: 0.2,
        [Kinds.ADULT]: 0.92,
    },
}

const classDistribution = {
    [Kinds.YOUNG]: 0.1,
    [Kinds.ADULT]: 0.9
}

const knowledge = {
    [Programs.PROG1]: true,
    [Programs.PROG2]: false,
    [Programs.PROG3]: true,
    [Programs.PROG4]: false,
}

export default function exercise1() {
    const engine = new NaiveBayesEngine<Programs, Kinds>(distribution, classDistribution)
    const computed = engine.probabilities(knowledge);
    console.log(`Ejercicio 1: probabilidades entre jóvenes y adultos`)
    console.log(computed);
    return computed;
}
