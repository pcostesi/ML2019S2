import consola from "consola";
import { from, of, zip } from "rxjs";
import { filter, flatMap, groupBy, map, mergeMap, reduce, toArray } from "rxjs/operators";
import { DatasetRow } from "./bayes";
import { Experiment } from "./benchmark";
import read from "./reader";
// taken from https://raw.githubusercontent.com/stopwords-iso/stopwords-es/master/stopwords-es.json
import stopwords from "./stopwords-es.json";

const TOP_WORDS = 250;

function toDataRow(sentence: string) {
    const phrase = sentence.toLowerCase();
    // split on weird symbols
    const words = phrase.split(/[ \t\n\r\.\,;:\(\)\[\]\{\}]/)
        .filter(v => !!v)
        .filter((w) => !stopwords.includes(w))
        .filter((w) => !/\P{L}/u.test(w))
        // we don't want to miss things like VIH
        // (I mean, we don't want to catch it, but we want the filter to... You get it.)
        .filter((w) => w.length >= 3);
    return words;
}

export default async function exercise3() {
    const categoryFilter = /destacada/gi;
    const records = read("aa_bayes.csv");

    // sort by category usage
    const categoriesSorted = await from(records).pipe(
        filter((record: any) => !!record.categoria.trim()),
        groupBy((record: any) => record.categoria.toLowerCase(), () => 1),
        mergeMap((group) => zip(of(group.key), group.pipe(reduce((a, b) => a + b, 0)))),
        toArray(),
        map((l) => l.sort((a, b) => b[1] - a[1])),
    ).toPromise();

    // let's remove some of the most common since those are noise in this dataset
    const explainedPairs = categoriesSorted.filter(key => !categoryFilter.test(key[0]))
    const explained = explainedPairs.map((v) => v[0]);
    const things = explainedPairs.map(p => `${p[0]} with #${p[1]}`).join("\n - ")
    consola.info(`Categories are: \n - ${things}.`);

    consola.info(`Cleaning dataset.`);

    // filter the data samples so we avoid the most common class
    const clean = await from(records).pipe(
        filter((record: any) => explained.includes(record.categoria.toLowerCase())),
        toArray(),
    ).toPromise();

    // split sentences into words
    const segmented = await from(clean).pipe(
        flatMap((record) => {
            const words = toDataRow(record.titular);
            return from(words.map((word) => ({ word, kind: record.categoria })));
        }),
        toArray(),
    ).toPromise();

    // grab the most common words
    consola.info(`Selecting the top ${TOP_WORDS} words.`);

    const mapped = await from(segmented).pipe(
        // split into classes
        groupBy((record) => record.kind),
        flatMap((group) => group.pipe(
            // count
            groupBy((mapping) => mapping.word, () => 1),
            mergeMap((sub) => zip(of(sub.key), sub.pipe(reduce((a, b) => a + b, 0)))),
            toArray(),
            map((l) => l.sort((a, b) => b[1] - a[1])),
            map((l) => l.slice(0, TOP_WORDS)),
            map((entries) => [group.key, new Map(entries)]),
        )),
        toArray(),
        map((entries) => new Map(entries as [string, any])),
    ).toPromise() as Map<string, Map<string, number>>;

    // the most common words are going to be our explainer variables
    const explainersKeys = [...new Set([...mapped.values()].flatMap((counter) => [...counter.keys()]))].sort();
    consola.info(`Will use <<${explainersKeys.join(", ")}>>.`);

    class WordPredictionExperiment extends Experiment<string, string, any> {
        public rowLoader(t: any): DatasetRow<string, string> {
            // result is a mapping of explainer keys vs exists or not in this sentence
            const result = new Map();
            const words = toDataRow(t.titular.toLowerCase());
            explainersKeys.forEach((key) => {
                result.set(key, words.includes(key));
            });
            return {
                choices: result,
                kind: t.categoria.toLowerCase(),
            };
        }
    }

    const experiment = new WordPredictionExperiment(clean, explained);
    // const exResult = experiment.naive();
    const exResult = experiment.crossValidation(10);
    return exResult;
}
