"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const normalizeMap = (map) => {
    const normalized = new Map();
    // we know the sum of all the probabilities should be 1, so we normalize the number
    const total = [...map.values()].reduce((a, b) => a + b, 0);
    map.forEach((v, key) => normalized.set(key, v / total));
    return normalized;
};
const laplaceNormalizeMap = (map, k) => {
    const normalized = new Map();
    const total = [...map.values()].reduce((a, b) => a + b, 0);
    map.forEach((v, key) => normalized.set(key, (v + 1) / (total + k)));
    return normalized;
};
class BayesResult {
    constructor(_raw) {
        this._raw = _raw;
        this._normalized = normalizeMap(_raw);
        const entries = [...this.normalized.entries()];
        const sorted = entries.sort(([, v1], [, v2]) => v2 - v1);
        const ranked = sorted.map(([k, v]) => `- ${k}: \t${(v * 100).toFixed(2)}`);
        this._description = `Most Likely class is '${sorted[0][0]}' by ${(sorted[0][1] * 100).toFixed(2)}%.` +
            `\nRanking is:\n${ranked.join('\n')}\n---\n\n`;
    }
    get raw() {
        return this._raw;
    }
    get normalized() {
        return this._normalized;
    }
    toString() {
        return this._description;
    }
}
function datasetLoader(dataset, useLaplace = false) {
    // we assume the dataset has all the explained variants. I.E.: in the English vs Scottish,
    // we're not missing either Englsh or Scottish.
    const collection = new Map();
    const classDistribution = new Map();
    const normalizer = useLaplace ? laplaceNormalizeMap : normalizeMap;
    for (const row of dataset) {
        const explained = row.kind;
        const explainer = row.choices;
        // count each time we see a class
        const p = (classDistribution.get(explained) || 0);
        classDistribution.set(explained, p + 1);
        // for each variable (choice), group it by class
        for (const [choice, choiceValue] of explainer) {
            const variableGroup = collection.get(choice) || new Map();
            const value = variableGroup.get(explained) || 0;
            variableGroup.set(explained, value + (choiceValue ? 1 : 0));
            collection.set(choice, variableGroup);
        }
    }
    // normalize maps
    for (const [T, classes] of collection.entries()) {
        collection.set(T, normalizer(classes, classDistribution.size));
    }
    const pClassDistribution = normalizeMap(classDistribution);
    return {
        distribution: collection,
        classDistribution: pClassDistribution
    };
}
exports.datasetLoader = datasetLoader;
class NaiveBayesEngine {
    constructor(distribution, classesDistribution) {
        this.distribution = distribution;
        this.classesDistribution = classesDistribution;
    }
    probabilities(vector) {
        const choices = this.distribution;
        const classes = this.classesDistribution;
        const rawMap = new Map();
        // for each class, compute the probability using Bayes
        classes.forEach((classP, className) => {
            // this does the product for every probability in the vector
            const accumulator = (orig, entry) => {
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
exports.NaiveBayesEngine = NaiveBayesEngine;
function group(obj) {
    return new Map(Object.entries(obj));
}
exports.group = group;
