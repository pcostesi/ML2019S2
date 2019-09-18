import { splitters } from "./benchmark";

test("should split into several lists", () => {
    const size = 100 + Math.round(Math.random() * 100);
    const cross = splitters.cross;
    const input = [...new Array(size)].map((_, i) => i + 1);
    const result = cross<number>(10, input);
    for (const { training, testing } of result) {
        expect(testing).toHaveLength(Math.floor(size / 10));
        expect([...training, ...testing]).toHaveLength(size);
        training.forEach((n) => {
            expect(testing).not.toContain(n);
        });
    }
});
