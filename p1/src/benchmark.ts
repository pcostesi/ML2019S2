import consola from "consola";
import { NumericLiteral } from "typescript";
import { BayesData, BayesResult, datasetLoader, DatasetRow, NaiveBayesEngine } from "./bayes";

// tslint:disable-next-line: max-classes-per-file
class Stats {
    constructor(
        public truePositive: number,
        public trueNegative: number,
        public falsePositive: number,
        public falseNegative: number,
    ) { }
}

const SPACING = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]

type RocData<C> = { guessed: BayesResult<C>, actual: C }[]
export class RocRow {
    cliff: number;
    fpr: number;
    tpr: number;
}

// tslint:disable-next-line: max-classes-per-file
export class ConfusionMatrix<C> {

    public table = new Map<C, Map<C, number>>();
    private rowTotals = new Map<C, number>();
    private colTotals = new Map<C, number>();
    private allTotals = 0;

    constructor(private classes: C[]) {
        // actual as in the posta
        for (const actual of classes) {
            this.rowTotals.set(actual, 0);
            this.colTotals.set(actual, 0);
            const actualRow = new Map<C, number>();
            this.table.set(actual, actualRow);
            for (const guessed of classes) {
                actualRow.set(guessed, 0);
            }
        }
    }

    get all() {
        return this.allTotals;
    }


    public actualTotal(category: C) {
        return this.rowTotals.get(category) || 0;
    }

    public guessedTotal(category: C) {
        return this.colTotals.get(category) || 0;
    }

    public get(actual: C, guessed: C) {
        const actualRow = this.table.get(actual);
        if (!actualRow) {
            throw new Error(`class "${actual}" does not exist`);
        }
        return actualRow.get(guessed) || 0;

    }

    public increase(actual: C, guessed: C, amount = 1) {
        const actualRow = this.table.get(actual);
        if (!actualRow) {
            throw new Error(`class "${actual}" does not exist`);
        }
        this.allTotals += amount;
        const finalVal = this.get(actual, guessed) + amount;
        actualRow.set(guessed, finalVal);
        this.rowTotals.set(actual, (this.rowTotals.get(actual) || 0) + amount);
        this.colTotals.set(guessed, (this.colTotals.get(guessed) || 0) + amount);
        return finalVal;
    }

    public add(matrix: ConfusionMatrix<C>) {
        const newMatrix = new ConfusionMatrix(this.classes);
        for (const actual of this.classes) {
            for (const guessed of this.classes) {
                const mine = this.get(actual, guessed)
                const theirs = matrix.get(actual, guessed)
                newMatrix.increase(actual, guessed, mine + theirs)
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
        const roc = new Map();
        for (const { testing, training } of datasets) {
            consola.info(`Batch ${++n}`);

            const evaluation = this.benchmark(training, testing);
            matrix = matrix.add(evaluation.matrix);
            correct += evaluation.correct;
            incorrect += evaluation.incorrect;
            const rocResult = this.computeROC(evaluation.rocData)
            rocResult.forEach((values, key) => {
                const newValues = values.map(({ cliff, fpr, tpr }, idx) => {
                    const rocData = roc.get(key) || [];
                    const theRoc = rocData[idx] || { cliff, fpr: 0, tpr: 0 }
                    return {
                        cliff,
                        fpr: fpr / split + theRoc.fpr,
                        tpr: tpr / split + theRoc.tpr,
                    }
                })
                roc.set(key, newValues)
            })
        }
        const stats = this.computeStats(matrix);

        return { matrix, stats, correct, incorrect, roc };
    }

    public naive(split = 0.8) {
        consola.info(`Running naive`);
        const dataset = splitters.naive(split, this.dataset);
        let matrix = new ConfusionMatrix(this.classes);
        let correct = 0;
        let incorrect = 0;
        const { testing, training } = dataset

        const evaluation = this.benchmark(training, testing);
        // matrix = matrix.add(evaluation.matrix);
        matrix = (evaluation.matrix);
        correct += evaluation.correct;
        incorrect += evaluation.incorrect;

        const stats = this.computeStats(matrix);
        const roc = this.computeROC(evaluation.rocData)


        return { matrix, stats, correct, incorrect, roc };
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

            const falsePositive = guessed - truePositive;
            const falseNegative = actual - truePositive;
            const trueNegative = matrix.all - truePositive - falsePositive - falseNegative;

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

    private computeROC(rocData: RocData<C>, spacing: number[] = SPACING) {
        const rocResult = new Map<C, RocRow[]>()

        const categories = new Set(Array.from(rocData.values()).map(({ actual }) => actual))
        for (const category of categories) {
            for (const spacingIdx in spacing) {
                const cliff = spacing[spacingIdx]
                let [tp, fp, tn, fn] = [0, 0, 0, 0]
                for (const { actual, guessed } of rocData) {
                    const p = guessed.probabilities.get(category)
                    const overCliff = p >= cliff
                    if (category == actual) {
                        if (overCliff) {
                            tp += 1
                        } else {
                            fn += 1
                        }
                    } else {
                        if (overCliff) {
                            fp += 1
                        } else {
                            tn += 1
                        }
                    }
                }
                const tpr = tp / (tp + fn)
                const fpr = fp / (fp + tn)
                const results = rocResult.get(category) || []
                const result = { cliff, tpr, fpr }
                results[spacingIdx] = result
                rocResult.set(category, results)
            }
        }
        return rocResult;
    }

    public benchmark(training: D[], testing: D[]) {
        const matrix = new ConfusionMatrix(this.classes);
        const bayesData = this.datasetLoader(training);
        const engine = new NaiveBayesEngine(bayesData);
        const testingData = testing.map((t) => this.rowLoader(t));
        let correct = 0;
        let incorrect = 0;
        const rocData: RocData<C> = []
        for (const { choices, kind } of testingData) {
            const guessed = engine.probabilities(choices);
            matrix.increase(kind, guessed.answer);
            if (kind === guessed.answer) {
                correct += 1;
            } else {
                incorrect += 1;
            }
            rocData.push({ guessed, actual: kind })
        }
        consola.info(`Ran a benchmark of ${correct} over ${correct + incorrect}`);

        return {
            correct,
            engine,
            incorrect,
            matrix,
            rocData
        };
    }
}
