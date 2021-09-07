import {
    laplaceNormalizeMap, group, normalizeMap, BayesResult
} from "./bayes";

// test("should group things", () => {
//     const result = group({
//         "a": 1,
//         "b": 2,
//         "c": 3,
//     })
//     expect(result).(Map,([
//         ["a", 1],
//         ["b", 2],
//         ["c", 3],
//     ]))
// });

test("should do laplace normalization", () => {
    const groups = new Map([
        ["a", 3],
        ["b", 2],
        ["c", 1],
    ]);
    const normalized = laplaceNormalizeMap(groups, 3)
    expect(normalized.get("a")).toBe(4 / 9)
})

test("should do standard normalization", () => {
    const groups = new Map([
        ["a", 3],
        ["b", 2],
        ["c", 1],
    ]);
    const normalized = normalizeMap(groups)
    expect(normalized.get("a")).toBe(3 / 6)
})

test("A result should give me a good guess", () => {
    const classP = new Map([
        ["a", 3],
        ["b", 2],
        ["c", 1],
    ])
    const result = new BayesResult(classP);
    expect(result.answer).toBe("a")
})
