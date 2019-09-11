type KnownProbabilities<T> = Map<T, boolean>;
type ClassProbabilities<C> = Map<C, number>;
type Probabilities<T, C> = Map<T, ClassProbabilities<C>>;
type Dataset<T, C> = { choices: KnownProbabilities<T>, kind: C }[];

const normalizeMap = <C>(map: Map<C, number>) => {
    const normalized = new Map<C, number>();
    // we know the sum of all the probabilities should be 1, so we normalize the number
    const total = [...map.values()].reduce((a, b) => a + b, 0)

    map.forEach((v, key) => normalized.set(key, v / total));
    return normalized;
}

const laplaceNormalizeMap = <C>(map: Map<C, number>, k: number) => {
    const normalized = new Map<C, number>();
    const total = [...map.values()].reduce((a, b) => a + b, 0)

    map.forEach((v, key) => normalized.set(key, (v + 1) / (total + k)));
    return normalized;
}

class BayesResult<C> {
    private _normalized: ClassProbabilities<C>;
    private _description: string;

    get raw() {
        return this._raw;
    }

    get normalized() {
        return this._normalized;
    }

    constructor(private _raw: ClassProbabilities<C>) {
        this._normalized = normalizeMap(_raw);
        const entries = [...this.normalized.entries()]
        const sorted = entries.sort(([, v1], [, v2]) => v2 - v1);
        const ranked = sorted.map(([k, v]) => `- ${k}: \t${(v * 100).toFixed(2)}%`)
        this._description = `Most Likely class is '${sorted[0][0]}' by ${(sorted[0][1] * 100).toFixed(2)}%.` +
            `\nRanking is:\n${ranked.join('\n')}\n---\n\n`
    }

    public toString() {
        return this._description;
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
        const explainer = row.choices;

        // count each time we see a class
        const p = (classDistribution.get(explained) || 0);
        classDistribution.set(explained, p + 1);

        // for each variable (choice), group it by class
        for (const [choice, choiceValue] of explainer) {
            const variableGroup: ClassProbabilities<C> = collection.get(choice) || new Map();
            const value = variableGroup.get(explained) || 0;
            variableGroup.set(explained, value + (choiceValue ? 1 : 0))
            collection.set(choice, variableGroup);
        }
    }
    // normalize maps
    for (const [T, classes] of collection.entries()) {
        collection.set(T, normalizer(classes, classDistribution.size));
    }

    const pClassDistribution = normalizeMap(classDistribution)

    return {
        distribution: collection,
        classDistribution: pClassDistribution
    };
}

export class NaiveBayesEngine<T, C> {
    constructor(
        private distribution: Probabilities<T, C>,
        private classesDistribution: ClassProbabilities<C>,
    ) { }

    probabilities(vector: KnownProbabilities<T>) {
        const choices = this.distribution;
        const classes = this.classesDistribution;
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
            }
            const probability = [...choices.entries()].reduce(accumulator, 1) * classP;
            rawMap.set(className, probability)
        })

        return new BayesResult(rawMap);
    }
}

export function group<T extends string, C>(obj: { [key in T]: C }) {
    return new Map(Object.entries(obj) as [[T, C]])
}

