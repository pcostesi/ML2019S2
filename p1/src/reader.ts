import parse from "csv-parse/lib/sync";
import fs from "fs";

export default function read(path: string) {
    const input = fs.readFileSync(path);
    const records = parse(input, {
        columns: true,
        delimiter: "\t",
        quote: false,
        skip_empty_lines: true,
    });
    return records;
}
