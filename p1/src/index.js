"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bayes_1 = require("./bayes");
var Programs;
(function (Programs) {
    Programs["PROG1"] = "Programa 1";
    Programs["PROG2"] = "Programa 2";
    Programs["PROG3"] = "Programa 3";
    Programs["PROG4"] = "Programa 4";
})(Programs || (Programs = {}));
var Kinds;
(function (Kinds) {
    Kinds["YOUNG"] = "Joven";
    Kinds["ADULT"] = "Viejo";
})(Kinds || (Kinds = {}));
const distribution = {
    [Programs.PROG1]: {
        [Kinds.YOUNG]: 0.95,
        [Kinds.ADULT]: 0.03,
    },
    [Programs.PROG2]: {
        [Kinds.YOUNG]: 0.05,
        [Kinds.ADULT]: 0.82,
    },
    [Programs.PROG3]: {
        [Kinds.YOUNG]: 0.02,
        [Kinds.ADULT]: 0.34,
    },
    [Programs.PROG4]: {
        [Kinds.YOUNG]: 0.2,
        [Kinds.ADULT]: 0.92,
    },
};
const classDistribution = {
    [Kinds.YOUNG]: 0.1,
    [Kinds.ADULT]: 0.9
};
const knowledge = {
    [Programs.PROG1]: true,
    [Programs.PROG2]: false,
    [Programs.PROG3]: true,
    [Programs.PROG4]: false,
};
const engine = new bayes_1.NaiveBayesEngine(distribution, classDistribution);
console.log(engine.probabilities(knowledge));
