import * as XLSX from 'xlsx';

export async function extractXlsx(buffer: Buffer): Promise<string> {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false });
  const parts: string[] = [];

  for (const name of workbook.SheetNames) {
    const sheet = workbook.Sheets[name];
    if (!sheet) continue;
    const csv = XLSX.utils.sheet_to_csv(sheet, { blankrows: false }).trim();
    if (!csv) continue;
    parts.push(`# Sheet: ${name}\n${csv}`);
  }

  return parts.join('\n\n');
}
