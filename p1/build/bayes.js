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
    constructor(rawww) {
        this.rawww = rawww;
        this.norm = normalizeMap(rawww);
        const entries = [...this.normalized.entries()];
        const sorted = entries.sort(([, v1], [, v2]) => v2 - v1);
        const ranked = sorted.map(([k, v]) => `- ${(v * 100).toFixed(2)}% \t${k}`);
        this.description = `Most Likely class is '${sorted[0][0]}' by ${(sorted[0][1] * 100).toFixed(2)}%.` +
            `\nRanking is:\n${ranked.join("\n")}\n---\n\n`;
        this.ans = sorted[0][0];
    }
    get raw() {
        return this.rawww;
    }
    get normalized() {
        return this.norm;
    }
    get answer() {
        return this.ans;
    }
    toString() {
        return this.description;
    }
}
exports.BayesResult = BayesResult;
function datasetLoader(dataset, useLaplace = false) {
    // we assume the dataset has all the explained variants. I.E.: in the English vs Scottish,
    // we're not missing either Englsh or Scottish.
    const collection = new Map();
    const classDistribution = new Map();
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
    };
}
exports.datasetLoader = datasetLoader;
// tslint:disable-next-line: max-classes-per-file
class NaiveBayesEngine {
    // tslint:disable-next-line: no-empty
    constructor(data) {
        this.data = data;
    }
    probabilities(vector) {
        const choices = this.data.distribution;
        const classes = this.data.classesDistribution;
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
//# sourceMappingURL=bayes.js.map