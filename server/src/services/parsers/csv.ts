import { parse } from 'csv-parse/sync';

export async function extractCsv(buffer: Buffer): Promise<string> {
  const records = parse(buffer, {
    columns: false,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: true,
  }) as string[][];

  return records.map((row) => row.join(', ')).join('\n');
}
