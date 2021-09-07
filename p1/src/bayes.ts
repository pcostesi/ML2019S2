// this is the vector I want to test
export type FactVector<T> = Map<T, boolean>;

export type Probabilities<X> = Map<X, number>;

// given T, probability of X -> P(X|T)
export type CondProbabilities<X, Y> = Map<Y, Probabilities<X>>;
// tslint:disable-next-line: interface-name


// T is the explainer set, C is the explained set
export interface DatasetRow<T, C> { choices: FactVector<T>; kind: C; }
export type Dataset<T, C> = Array<DatasetRow<T, C>>;
// tslint:disable-next-line: interface-name
export interface BayesData<T, C> {
    likelyhood: CondProbabilities<T, C>;
    prior: Probabilities<C>;
}

export const normalizeMap = <C>(map: Map<C, number>) => {
    const normalized = new Map<C, number>();
    // we know the sum of all the probabilities should be 1, so we normalize the number
    const total = [...map.values()].reduce((a, b) => a + b, 0);

    map.forEach((v, key) => normalized.set(key, v / total));
    return normalized;
};

export const laplaceNormalizeMap = <C>(map: Map<C, number>, k: number) => {
    const normalized = new Map<C, number>();
    const total = [...map.values()].reduce((a, b) => a + b, 0);

    map.forEach((v, key) => normalized.set(key, (v + 1) / (total + k)));
    return normalized;
};


export class BayesResult<C> {
    private description: string;
    private ans: C;

    get probabilities() {
        return this.raw;
    }

    get answer() {
        return this.ans;
    }

    constructor(private raw: Probabilities<C>) {
        const entries = [...this.probabilities.entries()];
        const sorted = entries.sort(([, v1], [, v2]) => v2 - v1);
        const ranked = sorted.map(([k, v]) => `- ${(v * 100).toFixed(2)}% \t${k}`);
        this.description = `Most Likely class is '${sorted[0][0]}' by ${(sorted[0][1] * 100).toFixed(2)}%.` +
            `\nRanking is:\n${ranked.join("\n")}\n---\n\n`;
        this.ans = sorted[0][0];
    }

    public toString() {
        return this.description;
    }
}

export function datasetLoader<T, C>(dataset: Dataset<T, C>, useLaplace = false): BayesData<T, C> {
    // we assume the dataset has all the explained variants. I.E.: in the English vs Scottish,
    // we're not missing either Englsh or Scottish.
    const likelyhood: CondProbabilities<T, C> = new Map();
    const prior: Probabilities<C> = new Map();
    const evidence: Probabilities<T> = new Map();
    const normalizer = useLaplace ? laplaceNormalizeMap : normalizeMap;

    for (const row of dataset) {
        const explained = row.kind;
        const explainer = row.choices;
        // compute prior
        prior.set(explained, (prior.get(explained) || 0) + 1)

        // for each variable (choice), group it by class (phrase -> vectorize)
        for (const [choice, isTrue] of explainer) {
            evidence.set(choice, (evidence.get(choice) || 0) + 1)
            let givenY = likelyhood.get(explained)
            if (!givenY) {
                givenY = new Map();
                likelyhood.set(explained, givenY)
            }
            const count = givenY.get(choice) || 0
            givenY.set(choice, isTrue ? count + 1 : count)
        }
    }

    const normalizedLikelyhood = new Map()
    likelyhood.forEach((probabilities, cls) => {
        normalizedLikelyhood.set(cls, normalizer(probabilities, evidence.size))
    })
    return {
        likelyhood: normalizedLikelyhood,
        prior: normalizer(prior, prior.size),
    }
}

// tslint:disable-next-line: max-classes-per-file
export class NaiveBayesEngine<T, C> {
    // tslint:disable-next-line: no-empty
    constructor(private data: BayesData<T, C>) { }

    public probabilities(vector: FactVector<T>) {
        const rawMap: Probabilities<C> = new Map();

        const fn = ([cls, p]) => Array.from(this.data.likelyhood.get(cls))
            .map(([explainer, p]) => {
                return vector.get(explainer) ? p : 1 - p
            })
            .reduce((a, b) => a * b, 1) * p

        const pX = Array.from(this.data.prior)
            .map(fn)
            .reduce((a, b) => a + b, 0)

        this.data.prior.forEach((prior, cls) => {
            const prob = (fn([cls, prior])) / pX
            rawMap.set(cls, prob)
        })

        return new BayesResult(rawMap);
    }
}

export function group<T extends string, C>(obj: { [key in T]: C }) {
    return new Map(Object.entries(obj) as [[T, C]]);
}
