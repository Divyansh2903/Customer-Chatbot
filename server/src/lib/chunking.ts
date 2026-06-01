// Naïve character-budget chunking with sentence-aware breaks.
// Char-count is used as a token proxy (~4 chars per token for English).

const TARGET_CHARS = 2000;      // ~500 tokens
const OVERLAP_CHARS = 200;      // ~50 tokens
const SENTENCE_SPLIT = /(?<=[.!?])\s+(?=[A-Z"'`(\[])/;

export function chunkText(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.length <= TARGET_CHARS) return [trimmed];

  const pieces = trimmed
    .split(SENTENCE_SPLIT)
    .flatMap((s) => (s.length > TARGET_CHARS ? splitByLength(s, TARGET_CHARS) : [s]));

  const chunks: string[] = [];
  let current = '';

  for (const piece of pieces) {
    if (!piece) continue;

    if (current && current.length + piece.length + 1 > TARGET_CHARS) {
      chunks.push(current);
      const tail = current.slice(-OVERLAP_CHARS);
      current = `${tail} ${piece}`;
    } else {
      current = current ? `${current} ${piece}` : piece;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

function splitByLength(s: string, n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < s.length; i += n) out.push(s.slice(i, i + n));
  return out;
}
