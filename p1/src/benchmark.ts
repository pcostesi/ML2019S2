type Metric = (stats: Stats) => number;

class Experiment {

}

// tslint:disable-next-line: max-classes-per-file
class Stats {
    constructor(
        public truePositive: number,
        public trueNegative: number,
        public falsePositive: number,
        public falseNegative: number,
    ) { }
}

function shuffle<T>(a: T[]) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export const metrics = {
    accuracy: (_: Stats) => {
        const correct = (_.truePositive + _.trueNegative);
        const overall = (_.truePositive + _.trueNegative + _.falsePositive + _.falseNegative);
        return correct / overall;
    },
    f1score: (_: Stats) => {
        const precision = metrics.precision(_);
        const recall = metrics.recall(_);
        return 2 * precision * recall / (precision + recall);
    },
    precision: (_: Stats) => _.truePositive / (_.truePositive + _.falsePositive),
    recall: (_: Stats) => _.truePositive / (_.truePositive + _.falseNegative),
    tpRate: (_: Stats) => _.truePositive / (_.truePositive + _.falsePositive),
    fpRate: (_: Stats) => _.falsePositive / (_.falsePositive + _.trueNegative),
};

export const splitters = {
    naive: <T>(split: number, dataset: T[]) => {
        const cutaway = Math.ceil(split * dataset.length);
        return {
            testing: dataset.slice(cutaway, dataset.length),
            training: dataset.slice(0, cutaway),
        };
    },
    random: <T>(split: number, dataset: T[]) => {
        const cutaway = Math.ceil(split * dataset.length);
        const shuffled = shuffle(dataset);
        return {
            testing: shuffled.slice(cutaway, shuffled.length),
            training: shuffled.slice(0, cutaway),
        };
    },
};
