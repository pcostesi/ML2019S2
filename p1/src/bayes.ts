type Probabilities<T extends string, C extends string> = { [key in T]: { [key in C]: number } };
type KnownProbabilities<T extends string> = { [key in T]: boolean };
type ClassProbabilities<C extends string> = { [key in C]: number };
type Dataset<T extends string, C extends string> = { choices: KnownProbabilities<T>, kind: C }[];


export function laplacify<T extends string, C extends string>(dataset: Dataset<T, C>) {
    const groups: { [key in C]?: KnownProbabilities<T>[] } = {};
    for (const row of dataset) {
        const group = (groups[row.kind] || []) as KnownProbabilities<T>[];
        groups[row.kind] = [...group, row.choices];
    }


}

export function datasetLoader<T extends string, C extends string>(dataset: Dataset<T, C>) {
    const collection: any = {};
    const classDistribution: any = {};

    for (const row of dataset) {
        classDistribution[row.kind] = (classDistribution[row.kind] || 0) as number + 1;

        for (const choice of Object.keys(row.choices)) {
            const choiceValue = row.choices[choice as T];
            const choiceRow = collection[choice] || [];
            const val = choiceRow[row.kind] || 0;
            choiceRow[row.kind] = val + (choiceValue ? 1 : 0);
            collection[choice] = choiceRow;
        }
    }

    for (const T of Object.keys(collection)) {
        const classes = collection[T];
        const sum = Object.entries(classes).reduce((t, [k, v]) => t + (v as number), 0);
        const mapped = Object.entries(classes).map(([k, v]) => ([k, (v as number) / sum]));
        collection[T] = Object.fromEntries(mapped);
    }

    const pClassDistribution = Object.fromEntries(Object.entries<number>(classDistribution)
        .map(([key, val]) => [key, val / dataset.length]))

    return {
        distribution: collection as Probabilities<T, C>,
        classDistribution: pClassDistribution as unknown as ClassProbabilities<C>
    };
}

export class NaiveBayesEngine<T extends string, C extends string> {
    constructor(
        private distribution: Probabilities<T, C>,
        private classesDistribution: ClassProbabilities<C>,
    ) { }

    probabilities(vector: KnownProbabilities<T>) {
        const choices = Object.keys(this.distribution);
        const classes = Object.keys(this.classesDistribution);
        // for each class, compute the probability using Bayes
        const entries = classes.map(className => {
            // this does the product of all
            const accumulator = (orig: number, choice: string) => {
                const matches = vector[choice as T];
                const p = this.distribution[choice as T][className as C];
                const factor = matches ? p : (1 - p);
                return orig * factor;
            }
            const probability = choices.reduce(accumulator, 1);
            return [className, probability];
        })
        return Object.fromEntries(entries);
    }
}
