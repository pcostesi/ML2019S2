"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const bayes_1 = require("./bayes");
const benchmark_1 = require("./benchmark");
const reader_1 = __importDefault(require("./reader"));
// taken from https://raw.githubusercontent.com/stopwords-iso/stopwords-es/master/stopwords-es.json
const stopwords_es_json_1 = __importDefault(require("./stopwords-es.json"));
const TOP_WORDS = 30;
function toDataRow(sentence) {
    const phrase = sentence.toLowerCase().replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "");
    const words = phrase.split(" ").filter((w) => w && !stopwords_es_json_1.default.includes(w));
    return words;
}
async function exercise3(phrase) {
    const records = reader_1.default("aa_bayes.tsv");
    // sort by category usage
    const categoriesSorted = await rxjs_1.from(records).pipe(operators_1.groupBy((record) => record.categoria, () => 1), operators_1.mergeMap((group) => rxjs_1.zip(rxjs_1.of(group.key), group.pipe(operators_1.reduce((a, b) => a + b, 0)))), operators_1.toArray(), operators_1.map((l) => l.sort((a, b) => b[1] - a[1]))).toPromise();
    // let's remove the most common since it's noise in this dataset
    const mostCommon = categoriesSorted[0][0];
    const explained = categoriesSorted.slice(1, categoriesSorted.length).map((v) => v[0]);
    console.log(`Most common: '${categoriesSorted[0][0]}' with ${categoriesSorted[0][1]} items.`);
    const clean = await rxjs_1.from(records).pipe(operators_1.filter((record) => record.categoria !== mostCommon), operators_1.toArray()).toPromise();
    const { training, testing } = benchmark_1.splitters.random(0.1, clean);
    // split sentences into words
    const segmented = await rxjs_1.from(training).pipe(operators_1.flatMap((record) => {
        const words = toDataRow(record.titular);
        return words.map((word) => ({ word, kind: record.categoria }));
    }), operators_1.toArray()).toPromise();
    // grab the most common words
    const mapped = await rxjs_1.from(segmented).pipe(
    // split into classes
    operators_1.groupBy((record) => record.kind), operators_1.flatMap((group) => group.pipe(
    // count
    operators_1.groupBy((mapping) => mapping.word, () => 1), operators_1.mergeMap((sub) => rxjs_1.zip(rxjs_1.of(sub.key), sub.pipe(operators_1.reduce((a, b) => a + b, 0)))), operators_1.toArray(), operators_1.map((l) => l.sort((a, b) => b[1] - a[1])), operators_1.map((l) => l.slice(0, TOP_WORDS)), operators_1.map((entries) => [group.key, new Map(entries)]))), operators_1.toArray(), operators_1.map((entries) => new Map(entries))).toPromise();
    // the most common words are going to be our explainer variables
    const explainersKeys = [...mapped.values()].flatMap((counter) => [...counter.keys()]).sort();
    function toExplainerEntry(sentence) {
        const result = new Map();
        const words = toDataRow(sentence);
        explainersKeys.forEach((key) => {
            result.set(key, words.includes(key));
        });
        return result;
    }
    const trainingSet = segmented.map((data) => ({
        choices: toExplainerEntry(data.word),
        kind: data.kind,
    }));
    const knowledge = toExplainerEntry(phrase);
    const bayesData = bayes_1.datasetLoader(trainingSet, true);
    const engine = new bayes_1.NaiveBayesEngine(bayesData.distribution, bayesData.classDistribution);
    const runs = testing.map((data) => {
        const sentence = data.titular;
        const kind = data.categoria;
        const input = toExplainerEntry(sentence);
        const guessed = engine.probabilities(input).answer;
        return {
            correct: kind,
            guessed,
            matches: kind === guessed,
        };
    });
    console.log(runs);
    const computed = engine.probabilities(knowledge);
    console.log(computed.toString());
}
exports.default = exercise3;
