"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const consola_1 = __importDefault(require("consola"));
const bayes_1 = require("./bayes");
// tslint:disable-next-line: max-classes-per-file
class Stats {
    constructor(truePositive, trueNegative, falsePositive, falseNegative) {
        this.truePositive = truePositive;
        this.trueNegative = trueNegative;
        this.falsePositive = falsePositive;
        this.falseNegative = falseNegative;
    }
}
// tslint:disable-next-line: max-classes-per-file
class ConfusionMatrix {
    constructor(classes) {
        this.classes = classes;
        this.table = new Map();
        this.rowTotals = new Map();
        this.colTotals = new Map();
        this.allTotals = 0;
        for (const actual of classes) {
            this.rowTotals.set(actual, 0);
            this.colTotals.set(actual, 0);
            const actualRow = new Map();
            this.table.set(actual, actualRow);
            for (const guessed of classes) {
                actualRow.set(guessed, 0);
            }
        }
    }
    get all() {
        return this.allTotals;
    }
    actualTotal(category) {
        return this.rowTotals.get(category) || 0;
    }
    guessedTotal(category) {
        return this.colTotals.get(category) || 0;
    }
    get(actual, guessed) {
        const actualRow = this.table.get(actual);
        if (!actualRow) {
            throw new Error("class does not exist");
        }
        return actualRow.get(guessed) || 0;
    }
    increase(actual, guessed) {
        const actualRow = this.table.get(actual);
        if (!actualRow) {
            throw new Error("class does not exist");
        }
        const finalVal = this.get(actual, guessed) + 1;
        actualRow.set(guessed, finalVal);
        this.rowTotals.set(actual, (this.rowTotals.get(actual) || 0) + 1);
        this.colTotals.set(actual, (this.colTotals.get(actual) || 0) + 1);
        actualRow.set(guessed, finalVal);
        return finalVal;
    }
    add(matrix) {
        const newMatrix = new ConfusionMatrix(this.classes);
        for (const actual of this.classes) {
            const actualRow = newMatrix.table.get(actual);
            if (!actualRow) {
                continue;
            }
            for (const guessed of this.classes) {
                const v = this.get(actual, guessed) + matrix.get(actual, guessed);
                actualRow.set(guessed, v);
            }
        }
        return newMatrix;
    }
}
exports.ConfusionMatrix = ConfusionMatrix;
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
    fpRate: (_) => _.falsePositive / (_.falsePositive + _.trueNegative),
    precision: (_) => _.truePositive / (_.truePositive + _.falsePositive),
    recall: (_) => _.truePositive / (_.truePositive + _.falseNegative),
    tpRate: (_) => _.truePositive / (_.truePositive + _.falsePositive),
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
    *cross(iterations, dataset) {
        const batchSize = Math.floor(dataset.length / iterations);
        const batchStops = [...new Array(iterations)].map((_, i) => i * batchSize);
        for (const mark of batchStops) {
            const testing = dataset.slice(mark, Math.min(mark + batchSize, dataset.length));
            const first = dataset.slice(0, mark);
            const last = dataset.slice(Math.min(mark + batchSize, dataset.length), dataset.length);
            yield {
                testing,
                training: [...first, ...last],
            };
        }
    },
};
// tslint:disable-next-line: max-classes-per-file
class Experiment {
    constructor(dataset, classes) {
        this.dataset = dataset;
        this.classes = classes;
    }
    crossValidation(split) {
        consola_1.default.info(`Running ${split} experiments`);
        const datasets = exports.splitters.cross(split, this.dataset);
        let matrix = new ConfusionMatrix(this.classes);
        let correct = 0;
        let incorrect = 0;
        let n = 0;
        for (const { testing, training } of datasets) {
            consola_1.default.info(`Batch ${++n}`);
            const evaluation = this.benchmark(training, testing);
            matrix = matrix.add(evaluation.matrix);
            correct += evaluation.correct;
            incorrect += evaluation.incorrect;
        }
        const stats = this.computeStats(matrix);
        return { matrix, stats, correct, incorrect };
    }
    datasetLoader(training) {
        consola_1.default.info(`Loading dataset`);
        const data = training.map((t) => this.rowLoader(t));
        return bayes_1.datasetLoader(data, true);
    }
    computeStats(matrix) {
        const stats = new Map();
        for (const category of this.classes) {
            consola_1.default.info(`Computing stats for ${category}`);
            const truePositive = matrix.get(category, category);
            const guessed = matrix.guessedTotal(category);
            const actual = matrix.actualTotal(category);
            const trueNegative = matrix.all + truePositive - actual - guessed;
            const falsePositive = guessed - truePositive;
            const falseNegative = actual - truePositive;
            const stat = { truePositive, trueNegative, falsePositive, falseNegative };
            const computed = new Map();
            computed.set("true positive", truePositive);
            computed.set("true negative", trueNegative);
            computed.set("false positive", falsePositive);
            computed.set("false negative", falseNegative);
            computed.set("f1-score", exports.metrics.f1score(stat));
            computed.set("accuracy", exports.metrics.accuracy(stat));
            computed.set("precision", exports.metrics.precision(stat));
            computed.set("recall", exports.metrics.recall(stat));
            computed.set("true positive rate", exports.metrics.tpRate(stat));
            computed.set("false positive rate", exports.metrics.fpRate(stat));
            stats.set(category, computed);
        }
        return stats;
    }
    benchmark(training, testing) {
        const matrix = new ConfusionMatrix(this.classes);
        const bayesData = this.datasetLoader(training);
        const engine = new bayes_1.NaiveBayesEngine(bayesData);
        const testingData = testing.map((t) => this.rowLoader(t));
        let correct = 0;
        let incorrect = 0;
        for (const { choices, kind } of testingData) {
            const guessed = engine.probabilities(choices);
            if (kind === guessed.answer) {
                matrix.increase(kind, guessed.answer);
                correct += 1;
            }
            else {
                incorrect += 1;
            }
        }
        consola_1.default.info(`Ran a benchmark of ${correct} over ${correct + incorrect}`);
        return {
            correct,
            engine,
            incorrect,
            matrix,
        };
    }
}
exports.Experiment = Experiment;
//# sourceMappingURL=benchmark.js.map