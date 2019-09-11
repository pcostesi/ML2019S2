"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Experiment {
}
// tslint:disable-next-line: max-classes-per-file
class Stats {
    constructor(truePositive, trueNegative, falsePositive, falseNegative) {
        this.truePositive = truePositive;
        this.trueNegative = trueNegative;
        this.falsePositive = falsePositive;
        this.falseNegative = falseNegative;
    }
}
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
exports.metrics = {
    accuracy: (_) => {
        const correct = (_.truePositive + _.trueNegative);
        const overall = (_.truePositive + _.trueNegative + _.falsePositive + _.falseNegative);
        return correct / overall;
    },
    f1score: (_) => {
        const precision = exports.metrics.precision(_);
        const recall = exports.metrics.recall(_);
        return 2 * precision * recall / (precision + recall);
    },
    precision: (_) => _.truePositive / (_.truePositive + _.falsePositive),
    recall: (_) => _.truePositive / (_.truePositive + _.falseNegative),
    tpRate: (_) => _.truePositive / (_.truePositive + _.falsePositive),
    fpRate: (_) => _.falsePositive / (_.falsePositive + _.trueNegative),
};
exports.splitters = {
    naive: (split, dataset) => {
        const cutaway = Math.ceil(split * dataset.length);
        return {
            testing: dataset.slice(cutaway, dataset.length),
            training: dataset.slice(0, cutaway),
        };
    },
    random: (split, dataset) => {
        const cutaway = Math.ceil(split * dataset.length);
        const shuffled = shuffle(dataset);
        return {
            testing: shuffled.slice(cutaway, shuffled.length),
            training: shuffled.slice(0, cutaway),
        };
    },
};
