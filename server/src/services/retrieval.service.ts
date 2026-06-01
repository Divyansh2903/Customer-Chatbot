import { ChunkModel } from '../models/chunk.js';
import { QAPairModel } from '../models/qa-pair.js';
import { DocumentModel } from '../models/document.js';
import { embedOne } from '../lib/gemini.js';

export type SourceType = 'document' | 'qa';

export interface RetrievedItem {
  type: SourceType;
  title: string;
  /** Full text fed to the model as context. */
  content: string;
  /** Short excerpt surfaced to the user as a citation. */
  snippet: string;
  score: number;
}

const TOP_K = 5;
// Cosine floor below which a match is treated as irrelevant. With task-type
// embeddings, genuinely relevant matches land ~0.65+ while off-topic queries top
// out ~0.58, so 0.6 separates them (tuned against the seed data).
const SCORE_FLOOR = 0.6;
// Curated Q&A is authored by hand, so nudge it ahead of extracted document text —
// but only as a gentle tiebreaker, or unrelated Q&A floats over the floor.
const QA_BOOST = 0.02;
const SNIPPET_LENGTH = 240;

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    const x = a[i] as number;
    const y = b[i] as number;
    dot += x * y;
    normA += x * x;
    normB += y * y;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function snippet(text: string): string {
  const trimmed = text.trim();
  return trimmed.length > SNIPPET_LENGTH
    ? `${trimmed.slice(0, SNIPPET_LENGTH).trimEnd()}…`
    : trimmed;
}

export async function retrieve(query: string): Promise<RetrievedItem[]> {
  const queryVec = await embedOne(query, 'RETRIEVAL_QUERY');

  const [chunks, qaPairs] = await Promise.all([
    ChunkModel.find({}, { content: 1, embedding: 1, documentId: 1 })
      .lean()
      .exec(),
    QAPairModel.find(
      { embedding: { $exists: true, $ne: null } },
      { question: 1, answer: 1, embedding: 1 },
    )
      .lean()
      .exec(),
  ]);

  const scored: RetrievedItem[] = [];

  if (chunks.length > 0) {
    const docIds = [...new Set(chunks.map((c) => String(c.documentId)))];
    const docs = await DocumentModel.find(
      { _id: { $in: docIds } },
      { originalName: 1 },
    )
      .lean()
      .exec();
    const nameById = new Map(docs.map((d) => [String(d._id), d.originalName]));

    for (const c of chunks) {
      if (!c.embedding?.length) continue;
      scored.push({
        type: 'document',
        title: nameById.get(String(c.documentId)) ?? 'Document',
        content: c.content,
        snippet: snippet(c.content),
        score: cosineSimilarity(queryVec, c.embedding),
      });
    }
  }

  for (const qa of qaPairs) {
    if (!qa.embedding?.length) continue;
    scored.push({
      type: 'qa',
      title: qa.question,
      content: `Q: ${qa.question}\nA: ${qa.answer}`,
      snippet: snippet(qa.answer),
      score: cosineSimilarity(queryVec, qa.embedding) + QA_BOOST,
    });
  }

  return scored
    .filter((s) => s.score >= SCORE_FLOOR)
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_K);
}
