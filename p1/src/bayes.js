"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NaiveBayesEngine {
    constructor(distribution, classesDistribution) {
        this.distribution = distribution;
        this.classesDistribution = classesDistribution;
    }
    probabilities(vector) {
        const choices = Object.keys(this.distribution);
        const classes = Object.keys(this.classesDistribution);
        const entries = classes.map(className => {
            const accumulator = (orig, choice) => {
                const matches = vector[choice];
                const p = this.distribution[choice][className];
                const factor = matches ? p : 1 - p;
                return orig * factor;
            };
            const probability = choices.reduce(accumulator, 1);
            return [className, probability];
        });
        return Object.fromEntries(entries);
    }
}
exports.NaiveBayesEngine = NaiveBayesEngine;
