import { from, of, zip } from "rxjs";
import { filter, flatMap, groupBy, map, mergeMap, reduce, toArray } from "rxjs/operators";
import { datasetLoader, NaiveBayesEngine } from "./bayes";
import { splitters } from "./benchmark";
import read from "./reader";
// taken from https://raw.githubusercontent.com/stopwords-iso/stopwords-es/master/stopwords-es.json
import stopwords from "./stopwords-es.json";

const TOP_WORDS = 30;

function toDataRow(sentence: string) {
    const phrase = sentence.toLowerCase().replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, "");
    const words = phrase.split(" ").filter((w) => w && !stopwords.includes(w));
    return words;
}

export default async function exercise3(phrase: string) {

    const records = read("aa_bayes.tsv");

    // sort by category usage
    const categoriesSorted = await from(records).pipe(
        groupBy((record: any) => record.categoria, () => 1),
        mergeMap((group) => zip(of(group.key), group.pipe(reduce((a, b) => a + b, 0)))),
        toArray(),
        map((l) => l.sort((a, b) => b[1] - a[1])),
    ).toPromise();

    // let's remove the most common since it's noise in this dataset
    const mostCommon = categoriesSorted[0][0];
    const explained = categoriesSorted.slice(1, categoriesSorted.length).map((v) => v[0]);

    console.log(`Most common: '${categoriesSorted[0][0]}' with ${categoriesSorted[0][1]} items.`);

    const clean = await from(records).pipe(
        filter((record: any) => record.categoria !== mostCommon),
        toArray(),
    ).toPromise();

    const { training, testing } = splitters.random(0.1, clean);

    // split sentences into words
    const segmented = await from(training).pipe(
        flatMap((record) => {
            const words = toDataRow(record.titular);
            return words.map((word) => ({ word, kind: record.categoria }));
        }),
        toArray(),
    ).toPromise();

    // grab the most common words
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
    const explainersKeys = [...mapped.values()].flatMap((counter) => [...counter.keys()]).sort();

    function toExplainerEntry(sentence: string) {
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

    const bayesData = datasetLoader(trainingSet, true);
    const engine = new NaiveBayesEngine(bayesData.distribution, bayesData.classDistribution);

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
