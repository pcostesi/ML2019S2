import { group, NaiveBayesEngine } from "./bayes";

enum Programs {
    PROG1 = "Programa 1",
    PROG2 = "Programa 2",
    PROG3 = "Programa 3",
    PROG4 = "Programa 4",
}

enum Kinds {
    YOUNG = "Joven",
    ADULT = "Viejo",
}

const distribution = group({
    [Programs.PROG1]: group({
        [Kinds.YOUNG]: 0.95,
        [Kinds.ADULT]: 0.03,
    }),
    [Programs.PROG2]: group({
        [Kinds.YOUNG]: 0.05,
        [Kinds.ADULT]: 0.82,
    }),
    [Programs.PROG3]: group({
        [Kinds.YOUNG]: 0.02,
        [Kinds.ADULT]: 0.34,
    }),
    [Programs.PROG4]: group({
        [Kinds.YOUNG]: 0.2,
        [Kinds.ADULT]: 0.92,
    }),
});

const classesDistribution = group({
    [Kinds.YOUNG]: 0.1,
    [Kinds.ADULT]: 0.9,
});

const knowledge = group({
    [Programs.PROG1]: true,
    [Programs.PROG2]: false,
    [Programs.PROG3]: true,
    [Programs.PROG4]: false,
});

export default function exercise1() {
    const engine = new NaiveBayesEngine<Programs, Kinds>({ distribution, classesDistribution });
    const computed = engine.probabilities(knowledge);
    return computed;
}
