"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
// taken from https://raw.githubusercontent.com/stopwords-iso/stopwords-es/master/stopwords-es.json
const stopwords_es_json_1 = __importDefault(require("../stopwords-es.json"));
const bayes_1 = require("./bayes");
const benchmark_1 = require("./benchmark");
const reader_1 = __importDefault(require("./reader"));
function format(records) {
    const result = [];
    for (const record of records) {
        const phrase = record.titular.toLowerCase().replace(/\W/g, "");
        for (const word of phrase.split(" ")) {
            if (stopwords_es_json_1.default.includes(word)) {
                continue;
            }
            result.push({ choices: word, kind: record.categoria });
        }
    }
    return result;
}
async function exercise3() {
    const records = reader_1.default("aa_bayes.tsv");
    // sort by category usage
    const categoriesSorted = await rxjs_1.from(records).pipe(operators_1.groupBy((record) => record.categoria, (p) => 1), operators_1.mergeMap((group) => rxjs_1.zip(rxjs_1.of(group.key), group.pipe(operators_1.reduce((a, b) => a + b, 0)))), operators_1.toArray(), operators_1.map((l) => l.sort((a, b) => b[1] - a[1]))).toPromise();
    // let's remove the most common since it's noise in this dataset
    const mostCommon = categoriesSorted[0][0];
    console.log(`Most common: '${categoriesSorted[0][0]}' with ${categoriesSorted[0][1]} items.`);
    const clean = await rxjs_1.from(records).pipe(operators_1.filter((record) => record.categoria !== mostCommon), operators_1.toArray()).toPromise();
    const { training, testing } = benchmark_1.splitters.random(0.3, clean);
    const formattedTrainingData = format(training);
    const { distribution, classDistribution } = bayes_1.datasetLoader(formattedTrainingData, true);
    console.log(distribution);
    console.log(classDistribution);
}
exports.default = exercise3;
