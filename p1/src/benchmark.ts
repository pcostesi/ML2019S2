import consola from "consola";
import { BayesData, datasetLoader, DatasetRow, NaiveBayesEngine } from "./bayes";

// tslint:disable-next-line: max-classes-per-file
class Stats {
    constructor(
        public truePositive: number,
        public trueNegative: number,
        public falsePositive: number,
        public falseNegative: number,
    ) { }
}

// tslint:disable-next-line: max-classes-per-file
export class ConfusionMatrix<C> {

    private _table = new Map<C, Map<C, number>>();
    private rowTotals = new Map<C, number>();
    private colTotals = new Map<C, number>();
    private allTotals = 0;

    constructor(private classes: C[]) {
        for (const actual of classes) {
            this.rowTotals.set(actual, 0);
            this.colTotals.set(actual, 0);
            const actualRow = new Map<C, number>();
            this._table.set(actual, actualRow);
            for (const guessed of classes) {
                actualRow.set(guessed, 0);
            }
        }
    }

    get all() {
        return this.allTotals;
    }

    get table() {
        const theTable: any = {}
        for (const [row, rowData] of Object.entries(this._table)) {
            theTable[row] = {}
            for (const [col, data] of Object.entries(rowData)) {
                theTable[row][col] = data
            }
        }
        console.table(theTable)
        return theTable
    }

    public actualTotal(category: C) {
        return this.rowTotals.get(category) || 0;
    }

    public guessedTotal(category: C) {
        return this.colTotals.get(category) || 0;
    }

    public get(actual: C, guessed: C) {
        const actualRow = this._table.get(actual);
        if (!actualRow) {
            throw new Error(`class "${actual}" does not exist`);
        }
        return actualRow.get(guessed) || 0;

    }

    public increase(actual: C, guessed: C) {
        const actualRow = this._table.get(actual);
        if (!actualRow) {
            throw new Error(`class "${actual}" does not exist`);
        }
        const finalVal = this.get(actual, guessed) + 1;
        actualRow.set(guessed, finalVal);
        this.rowTotals.set(actual, (this.rowTotals.get(actual) || 0) + 1);
        this.colTotals.set(actual, (this.colTotals.get(actual) || 0) + 1);
        actualRow.set(guessed, finalVal);
        return finalVal;
    }

    public add(matrix: ConfusionMatrix<C>) {
        const newMatrix = new ConfusionMatrix(this.classes);
        for (const actual of this.classes) {
            const actualRow = newMatrix._table.get(actual);
            if (!actualRow) { continue; }
            for (const guessed of this.classes) {
                const v = this.get(actual, guessed) + matrix.get(actual, guessed);
                actualRow.set(guessed, v);
            }
        }
        return newMatrix;
    }
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
    fpRate: (_: Stats) => _.falsePositive / (_.falsePositive + _.trueNegative),
    precision: (_: Stats) => _.truePositive / (_.truePositive + _.falsePositive),
    recall: (_: Stats) => _.truePositive / (_.truePositive + _.falseNegative),
    tpRate: (_: Stats) => _.truePositive / (_.truePositive + _.falsePositive),
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
    *cross<T>(iterations: number, dataset: T[]) {
        const batchSize = Math.floor(dataset.length / iterations);
        const batchStops = [...new Array(iterations)].map((_, i: number) => i * batchSize);
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
export abstract class Experiment<T, C, D> {
    constructor(private dataset: D[], private classes: C[]) { }

    public crossValidation(split: number) {
        consola.info(`Running ${split} experiments`);
        const datasets = splitters.cross(split, this.dataset);
        let matrix = new ConfusionMatrix(this.classes);
        let correct = 0;
        let incorrect = 0;
        let n = 0;
        for (const { testing, training } of datasets) {
            consola.info(`Batch ${++n}`);

            const evaluation = this.benchmark(training, testing);
            matrix = matrix.add(evaluation.matrix);
            correct += evaluation.correct;
            incorrect += evaluation.incorrect;
        }
        const stats = this.computeStats(matrix);

        return { matrix, stats, correct, incorrect };
    }

    public datasetLoader(training: any[]): BayesData<T, C> {
        consola.info(`Loading dataset`);
        const data = training.map((t) => this.rowLoader(t));
        return datasetLoader(data, true);
    }

    public abstract rowLoader(t: D): DatasetRow<T, C>;

    private computeStats(matrix: ConfusionMatrix<C>) {
        const stats = new Map<C, Map<string, number>>();

        for (const category of this.classes) {
            consola.info(`Computing stats for ${category}`);
            const truePositive = matrix.get(category, category);
            const guessed = matrix.guessedTotal(category);
            const actual = matrix.actualTotal(category);
            const trueNegative = matrix.all + truePositive - actual - guessed;
            const falsePositive = guessed - truePositive;
            const falseNegative = actual - truePositive;
            const stat = { truePositive, trueNegative, falsePositive, falseNegative };
            const computed = new Map<string, number>();
            computed.set("true positive", truePositive);
            computed.set("true negative", trueNegative);
            computed.set("false positive", falsePositive);
            computed.set("false negative", falseNegative);
            computed.set("f1-score", metrics.f1score(stat));
            computed.set("accuracy", metrics.accuracy(stat));
            computed.set("precision", metrics.precision(stat));
            computed.set("recall", metrics.recall(stat));
            computed.set("true positive rate", metrics.tpRate(stat));
            computed.set("false positive rate", metrics.fpRate(stat));
            stats.set(category, computed);
        }
        return stats;
    }

    private benchmark(training: D[], testing: D[]) {
        const matrix = new ConfusionMatrix(this.classes);
        const bayesData = this.datasetLoader(training);
        const engine = new NaiveBayesEngine(bayesData);
        const testingData = testing.map((t) => this.rowLoader(t));
        let correct = 0;
        let incorrect = 0;
        for (const { choices, kind } of testingData) {
            const guessed = engine.probabilities(choices);
            if (kind === guessed.answer) {
                matrix.increase(kind, guessed.answer);
                correct += 1;
            } else {
                incorrect += 1;
            }
        }
        consola.info(`Ran a benchmark of ${correct} over ${correct + incorrect}`);

        return {
            correct,
            engine,
            incorrect,
            matrix,
        };
    }
}
