"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const benchmark_1 = require("./benchmark");
test("should split into several lists", () => {
    const size = 100 + Math.round(Math.random() * 100);
    const cross = benchmark_1.splitters.cross;
    const input = [...new Array(size)].map((_, i) => i + 1);
    const result = cross(10, input);
    for (const { training, testing } of result) {
        expect(testing).toHaveLength(Math.floor(size / 10));
        expect([...training, ...testing]).toHaveLength(size);
        training.forEach((n) => {
            expect(testing).not.toContain(n);
        });
    }
});
//# sourceMappingURL=benchmark.test.js.map