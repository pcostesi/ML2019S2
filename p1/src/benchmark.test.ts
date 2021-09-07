import { splitters } from "./benchmark";

test("should split using `cross` into several lists", () => {
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

test("should split into several lists using naive", () => {
    const size = 100 + Math.round(Math.random() * 100);
    const split = 0.9
    const method = splitters.naive;
    const input = [...new Array(size)].map((_, i) => i + 1);
    const result = method<number>(split, input);
    const { training, testing } = result
    expect(testing).toHaveLength(Math.floor(size * (1 - split)));
    expect([...training, ...testing]).toHaveLength(size);
    training.forEach((n) => {
        expect(testing).not.toContain(n);
    });
});
