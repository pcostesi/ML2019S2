export type KnownProbabilities<T> = Map<T, boolean>;
export type ClassProbabilities<C> = Map<C, number>;
export type Probabilities<T, C> = Map<T, ClassProbabilities<C>>;
// tslint:disable-next-line: interface-name
export interface DatasetRow<T, C> { choices: KnownProbabilities<T>; kind: C; }
export type Dataset<T, C> = Array<DatasetRow<T, C>>;
// tslint:disable-next-line: interface-name
export interface BayesData<T, C> {
    distribution: Probabilities<T, C>;
    classesDistribution: ClassProbabilities<C>;
}

const normalizeMap = <C>(map: Map<C, number>) => {
    const normalized = new Map<C, number>();
    // we know the sum of all the probabilities should be 1, so we normalize the number
    const total = [...map.values()].reduce((a, b) => a + b, 0);

    map.forEach((v, key) => normalized.set(key, v / total));
    return normalized;
};

const laplaceNormalizeMap = <C>(map: Map<C, number>, k: number) => {
    const normalized = new Map<C, number>();
    const total = [...map.values()].reduce((a, b) => a + b, 0);

    map.forEach((v, key) => normalized.set(key, (v + 1) / (total + k)));
    return normalized;
};

export class BayesResult<C> {
    private description: string;
    private norm: ClassProbabilities<C>;
    private ans: C;

    get raw() {
        return this.rawww;
    }

    get normalized() {
        return this.norm;
    }

    get answer() {
        return this.ans;
    }

    constructor(private rawww: ClassProbabilities<C>) {
        this.norm = normalizeMap(rawww);
        const entries = [...this.normalized.entries()];
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

export function datasetLoader<T, C>(dataset: Dataset<T, C>, useLaplace = false) {
    // we assume the dataset has all the explained variants. I.E.: in the English vs Scottish,
    // we're not missing either Englsh or Scottish.
    const collection: Probabilities<T, C> = new Map();
    const classDistribution: ClassProbabilities<C> = new Map();
    const normalizer = useLaplace ? laplaceNormalizeMap : normalizeMap;

    for (const row of dataset) {
        const explained = row.kind;
        // count each time we see a class
        const p = (classDistribution.get(explained) || 0);
        classDistribution.set(explained, p + 1);
    }

    for (const row of dataset) {
        const explained = row.kind;
        const explainer = row.choices;

        // for each variable (choice), group it by class
        for (const [choice, choiceValue] of explainer) {
            let variableGroup = collection.get(choice);
            if (!variableGroup) {
                variableGroup = new Map([...classDistribution.keys()].map((k) => [k, 0]));
                collection.set(choice, variableGroup);
            }
            const value = variableGroup.get(explained) || 0;
            variableGroup.set(explained, value + (choiceValue ? 1 : 0));
        }
    }
    // normalize maps
    for (const [t, classes] of collection.entries()) {
        collection.set(t, normalizer(classes, classDistribution.size));
    }

    const pClassDistribution = normalizeMap(classDistribution);

    return {
        classesDistribution: pClassDistribution,
        distribution: collection,
    } as BayesData<T, C>;
}

// tslint:disable-next-line: max-classes-per-file
export class NaiveBayesEngine<T, C> {
    // tslint:disable-next-line: no-empty
    constructor(private data: BayesData<T, C>) { }

    public probabilities(vector: KnownProbabilities<T>) {
        const choices = this.data.distribution;
        const classes = this.data.classesDistribution;
        const rawMap: ClassProbabilities<C> = new Map();

        // for each class, compute the probability using Bayes
        classes.forEach((classP, className) => {
            // this does the product for every probability in the vector
            const accumulator = (orig: number, entry: [T, ClassProbabilities<C>]) => {
                const [variable, options] = entry;
                const matches = vector.get(variable);
                const p = options.get(className) || 0;
                // if it does match the entry value, we use p. Otherwise, use not p.
                const factor = matches ? p : (1 - p);
                return orig * factor;
            };
            const probability = [...choices.entries()].reduce(accumulator, 1) * classP;
            rawMap.set(className, probability);
        });

        return new BayesResult(rawMap);
    }
}

export function group<T extends string, C>(obj: { [key in T]: C }) {
    return new Map(Object.entries(obj) as [[T, C]]);
}
