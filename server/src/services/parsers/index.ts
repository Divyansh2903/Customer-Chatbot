import { HttpError } from '../../lib/http-error.js';
import { extractPdf } from './pdf.js';
import { extractDocx } from './docx.js';
import { extractXlsx } from './xlsx.js';
import { extractCsv } from './csv.js';
import { extractText } from './text.js';

type Extractor = (buffer: Buffer) => Promise<string>;

const EXTRACTORS: Record<string, Extractor> = {
  'application/pdf': extractPdf,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': extractDocx,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': extractXlsx,
  'text/csv': extractCsv,
  'text/plain': extractText,
};

export async function extractTextFromBuffer(
  buffer: Buffer,
  mime: string,
): Promise<string> {
  const extractor = EXTRACTORS[mime];
  if (!extractor) {
    throw HttpError.badRequest(`No extractor registered for MIME type: ${mime}`);
  }
  const raw = await extractor(buffer);
  return normalize(raw);
}

function normalize(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ') // collapse runs of spaces/tabs to a single space
    .replace(/ *\n/g, '\n') // drop trailing spaces before newlines
    .replace(/\n{3,}/g, '\n\n') // cap consecutive blank lines
    .trim();
}
