"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const consola_1 = __importDefault(require("consola"));
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const benchmark_1 = require("./benchmark");
const reader_1 = __importDefault(require("./reader"));
// taken from https://raw.githubusercontent.com/stopwords-iso/stopwords-es/master/stopwords-es.json
const stopwords_es_json_1 = __importDefault(require("./stopwords-es.json"));
const TOP_WORDS = 100;
function toDataRow(sentence) {
    const phrase = sentence.toLowerCase().replace(/[\d\[\]&\/\\#,+()$~%.'":*?<>{}]/g, "");
    const words = phrase.split(/\b/)
        .filter(Boolean)
        .filter((w) => !stopwords_es_json_1.default.includes(w))
        .filter((w) => w.length > 3);
    return words;
}
async function exercise3(phrase) {
    const records = reader_1.default("aa_bayes.tsv");
    // sort by category usage
    const categoriesSorted = await rxjs_1.from(records).pipe(operators_1.groupBy((record) => record.categoria, () => 1), operators_1.mergeMap((group) => rxjs_1.zip(rxjs_1.of(group.key), group.pipe(operators_1.reduce((a, b) => a + b, 0)))), operators_1.toArray(), operators_1.map((l) => l.sort((a, b) => b[1] - a[1]))).toPromise();
    // let's remove the most common since it's noise in this dataset
    const mostCommon = categoriesSorted[0][0];
    consola_1.default.info(`Most common word is: ${mostCommon}. Removing...`);
    const explained = categoriesSorted.slice(1, categoriesSorted.length).map((v) => v[0]);
    consola_1.default.info(`Categories are: \n - ${explained.join("\n - ")}.`);
    // console.log(`Most common: '${categoriesSorted[0][0]}' with ${categoriesSorted[0][1]} items.`);
    consola_1.default.info(`Cleaning dataset.`);
    // filter the data samples so we avoid the most common class
    const clean = await rxjs_1.from(records).pipe(operators_1.filter((record) => record.categoria !== mostCommon), operators_1.toArray()).toPromise();
    // split sentences into words
    const segmented = await rxjs_1.from(clean).pipe(operators_1.flatMap((record) => {
        const words = toDataRow(record.titular);
        return rxjs_1.from(words.map((word) => ({ word, kind: record.categoria })));
    }), operators_1.toArray()).toPromise();
    // grab the most common words
    consola_1.default.info(`Selecting the top ${TOP_WORDS} words.`);
    const mapped = await rxjs_1.from(segmented).pipe(
    // split into classes
    operators_1.groupBy((record) => record.kind), operators_1.flatMap((group) => group.pipe(
    // count
    operators_1.groupBy((mapping) => mapping.word, () => 1), operators_1.mergeMap((sub) => rxjs_1.zip(rxjs_1.of(sub.key), sub.pipe(operators_1.reduce((a, b) => a + b, 0)))), operators_1.toArray(), operators_1.map((l) => l.sort((a, b) => b[1] - a[1])), operators_1.map((l) => l.slice(0, TOP_WORDS)), operators_1.map((entries) => [group.key, new Map(entries)]))), operators_1.toArray(), operators_1.map((entries) => new Map(entries))).toPromise();
    // the most common words are going to be our explainer variables
    const explainersKeys = [...new Set([...mapped.values()].flatMap((counter) => [...counter.keys()]))].sort();
    consola_1.default.info(`Will use <<${explainersKeys.join(", ")}>>.`);
    class WordPredictionExperiment extends benchmark_1.Experiment {
        rowLoader(t) {
            const result = new Map();
            const words = toDataRow(t.titular);
            explainersKeys.forEach((key) => {
                result.set(key, words.includes(key));
            });
            return {
                choices: result,
                kind: t.categoria,
            };
        }
    }
    const experiment = new WordPredictionExperiment(clean, explained);
    const exResult = experiment.crossValidation(10);
    return exResult;
}
exports.default = exercise3;
//# sourceMappingURL=exercise3.js.map