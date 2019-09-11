import { datasetLoader, group, NaiveBayesEngine } from './bayes';

enum Choices {
    SCONS = 'Scones',
    BEER = 'Cerveza',
    WHISKY = 'Whisky',
    OAT = 'Avena',
    FOOTBALL = 'Fútbol'
}

enum Nationality {
    ENGLISH = 'Ingleses',
    SCOTTISH = 'Escoceses',
}

const knowledge = group({
    [Choices.SCONS]: true,
    [Choices.BEER]: false,
    [Choices.WHISKY]: true,
    [Choices.OAT]: true,
    [Choices.FOOTBALL]: false,
})

const mapper = (a: number[]) => new Map([
    [Choices.SCONS, !!a[0]],
    [Choices.BEER, !!a[1]],
    [Choices.WHISKY, !!a[2]],
    [Choices.OAT, !!a[3]],
    [Choices.FOOTBALL, !!a[4]],
])

// (scones, cerveza, whisky, avena, futbol)
const dataset = [
    { choices: mapper([0, 0, 1, 1, 1]), kind: Nationality.ENGLISH },
    { choices: mapper([1, 0, 1, 1, 0]), kind: Nationality.ENGLISH },
    { choices: mapper([1, 1, 0, 0, 1]), kind: Nationality.ENGLISH },
    { choices: mapper([1, 1, 0, 0, 0]), kind: Nationality.ENGLISH },
    { choices: mapper([0, 1, 0, 0, 1]), kind: Nationality.ENGLISH },
    { choices: mapper([0, 0, 0, 1, 0]), kind: Nationality.ENGLISH },

    { choices: mapper([1, 0, 0, 1, 1]), kind: Nationality.SCOTTISH },
    { choices: mapper([1, 1, 0, 0, 1]), kind: Nationality.SCOTTISH },
    { choices: mapper([1, 1, 1, 1, 0]), kind: Nationality.SCOTTISH },
    { choices: mapper([1, 1, 0, 1, 0]), kind: Nationality.SCOTTISH },
    { choices: mapper([1, 1, 0, 1, 1]), kind: Nationality.SCOTTISH },
    { choices: mapper([1, 0, 1, 1, 0]), kind: Nationality.SCOTTISH },
    { choices: mapper([1, 0, 1, 0, 0]), kind: Nationality.SCOTTISH },
]

// as the scons category is empty for the Scottish, we need to use Laplace.

export default function exercise2() {
    const { distribution, classDistribution } = datasetLoader(dataset, true);
    const engine = new NaiveBayesEngine<Choices, Nationality>(distribution, classDistribution)
    const computed = engine.probabilities(knowledge);
    console.log(`Ejercicio 2: Clasificación entre Ingleses y Escoceses`)
    console.log(computed.toString());
    return computed;
}
