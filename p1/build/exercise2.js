"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bayes_1 = require("./bayes");
var Choices;
(function (Choices) {
    Choices["SCONS"] = "Scones";
    Choices["BEER"] = "Cerveza";
    Choices["WHISKY"] = "Whisky";
    Choices["OAT"] = "Avena";
    Choices["FOOTBALL"] = "F\u00FAtbol";
})(Choices || (Choices = {}));
var Nationality;
(function (Nationality) {
    Nationality["ENGLISH"] = "Ingleses";
    Nationality["SCOTTISH"] = "Escoceses";
})(Nationality || (Nationality = {}));
const knowledge = bayes_1.group({
    [Choices.SCONS]: true,
    [Choices.BEER]: false,
    [Choices.WHISKY]: true,
    [Choices.OAT]: true,
    [Choices.FOOTBALL]: false,
});
const mapper = (a) => new Map([
    [Choices.SCONS, !!a[0]],
    [Choices.BEER, !!a[1]],
    [Choices.WHISKY, !!a[2]],
    [Choices.OAT, !!a[3]],
    [Choices.FOOTBALL, !!a[4]],
]);
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
];
// as the scons category is empty for the Scottish, we need to use Laplace.
function exercise2() {
    const { distribution, classDistribution } = bayes_1.datasetLoader(dataset, true);
    const engine = new bayes_1.NaiveBayesEngine(distribution, classDistribution);
    const computed = engine.probabilities(knowledge);
    console.log(`Ejercicio 2: Clasificación entre Ingleses y Escoceses`);
    console.log(computed.toString());
    return computed;
}
exports.default = exercise2;
