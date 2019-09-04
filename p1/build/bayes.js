"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function laplacify(dataset) {
    const groups = {};
    for (const row of dataset) {
        const group = (groups[row.kind] || []);
        groups[row.kind] = [...group, row.choices];
    }
}
exports.laplacify = laplacify;
function datasetLoader(dataset) {
    const collection = {};
    const classDistribution = {};
    for (const row of dataset) {
        classDistribution[row.kind] = (classDistribution[row.kind] || 0) + 1;
        for (const choice of Object.keys(row.choices)) {
            const choiceValue = row.choices[choice];
            const choiceRow = collection[choice] || [];
            const val = choiceRow[row.kind] || 0;
            choiceRow[row.kind] = val + (choiceValue ? 1 : 0);
            collection[choice] = choiceRow;
        }
    }
    for (const T of Object.keys(collection)) {
        const classes = collection[T];
        const sum = Object.entries(classes).reduce((t, [k, v]) => t + v, 0);
        const mapped = Object.entries(classes).map(([k, v]) => ([k, v / sum]));
        collection[T] = Object.fromEntries(mapped);
    }
    const pClassDistribution = Object.fromEntries(Object.entries(classDistribution)
        .map(([key, val]) => [key, val / dataset.length]));
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
        const choices = Object.keys(this.distribution);
        const classes = Object.keys(this.classesDistribution);
        // for each class, compute the probability using Bayes
        const entries = classes.map(className => {
            // this does the product for every probability in the vector
            const accumulator = (orig, choice) => {
                const matches = vector[choice];
                const p = this.distribution[choice][className];
                const factor = matches ? p : (1 - p);
                return orig * factor;
            };
            const classP = this.classesDistribution[className];
            const probability = choices.reduce(accumulator, 1) * classP;
            return [className, probability];
        });
        return Object.fromEntries(entries);
    }
}
exports.NaiveBayesEngine = NaiveBayesEngine;
