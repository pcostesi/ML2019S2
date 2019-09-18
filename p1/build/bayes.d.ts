export declare type KnownProbabilities<T> = Map<T, boolean>;
export declare type ClassProbabilities<C> = Map<C, number>;
export declare type Probabilities<T, C> = Map<T, ClassProbabilities<C>>;
export interface DatasetRow<T, C> {
    choices: KnownProbabilities<T>;
    kind: C;
}
export declare type Dataset<T, C> = Array<DatasetRow<T, C>>;
export interface BayesData<T, C> {
    distribution: Probabilities<T, C>;
    classesDistribution: ClassProbabilities<C>;
}
export declare class BayesResult<C> {
    private rawww;
    private description;
    private norm;
    private ans;
    readonly raw: Map<C, number>;
    readonly normalized: Map<C, number>;
    readonly answer: C;
    constructor(rawww: ClassProbabilities<C>);
    toString(): string;
}
export declare function datasetLoader<T, C>(dataset: Dataset<T, C>, useLaplace?: boolean): BayesData<T, C>;
export declare class NaiveBayesEngine<T, C> {
    private data;
    constructor(data: BayesData<T, C>);
    probabilities(vector: KnownProbabilities<T>): BayesResult<C>;
}
export declare function group<T extends string, C>(obj: {
    [key in T]: C;
}): Map<T, C>;
//# sourceMappingURL=bayes.d.ts.map