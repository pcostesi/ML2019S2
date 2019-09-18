import { BayesData, DatasetRow } from "./bayes";
declare class Stats {
    truePositive: number;
    trueNegative: number;
    falsePositive: number;
    falseNegative: number;
    constructor(truePositive: number, trueNegative: number, falsePositive: number, falseNegative: number);
}
export declare class ConfusionMatrix<C> {
    private classes;
    private table;
    private rowTotals;
    private colTotals;
    private allTotals;
    constructor(classes: C[]);
    readonly all: number;
    actualTotal(category: C): number;
    guessedTotal(category: C): number;
    get(actual: C, guessed: C): number;
    increase(actual: C, guessed: C): number;
    add(matrix: ConfusionMatrix<C>): ConfusionMatrix<C>;
}
export declare const metrics: {
    accuracy: (_: Stats) => number;
    f1score: (_: Stats) => number;
    fpRate: (_: Stats) => number;
    precision: (_: Stats) => number;
    recall: (_: Stats) => number;
    tpRate: (_: Stats) => number;
};
export declare const splitters: {
    naive: <T>(split: number, dataset: T[]) => {
        testing: T[];
        training: T[];
    };
    random: <T_1>(split: number, dataset: T_1[]) => {
        testing: T_1[];
        training: T_1[];
    };
    cross<T_2>(iterations: number, dataset: T_2[]): Generator<{
        testing: T_2[];
        training: T_2[];
    }, void, unknown>;
};
export declare abstract class Experiment<T, C, D> {
    private dataset;
    private classes;
    constructor(dataset: D[], classes: C[]);
    crossValidation(split: number): {
        matrix: ConfusionMatrix<C>;
        stats: Map<C, Map<string, number>>;
        correct: number;
        incorrect: number;
    };
    datasetLoader(training: any[]): BayesData<T, C>;
    abstract rowLoader(t: D): DatasetRow<T, C>;
    private computeStats;
    private benchmark;
}
export {};
//# sourceMappingURL=benchmark.d.ts.map