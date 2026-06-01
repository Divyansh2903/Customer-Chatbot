import { GoogleGenAI } from '@google/genai';
import { env } from './env.js';
import { logger } from './logger.js';

export const EMBEDDING_MODEL = 'gemini-embedding-001';
export const CHAT_MODEL = 'gemini-3.5-flash';
// Tried in order: the primary model can return 503 "high demand" when busy, so
// fall back to a steadier flash model before giving up.
export const CHAT_MODELS = [CHAT_MODEL, 'gemini-2.5-flash'];

const BATCH_SIZE = 100;
const MAX_ATTEMPTS = 3;

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function statusOf(err: unknown): number | undefined {
  const e = err as { status?: number; code?: number };
  return e?.status ?? e?.code;
}

/** Transient "model busy" error — worth retrying the same model after a backoff. */
function isRetryable(err: unknown): boolean {
  if (statusOf(err) === 503) return true;
  const msg = String((err as { message?: string })?.message ?? '');
  return /UNAVAILABLE|overloaded|high demand|try again later/i.test(msg);
}

/** Quota exhausted (e.g. free-tier daily cap) — retrying won't help; switch models. */
function isQuotaError(err: unknown): boolean {
  if (statusOf(err) === 429) return true;
  const msg = String((err as { message?: string })?.message ?? '');
  return /RESOURCE_EXHAUSTED|quota/i.test(msg);
}

/** Retry `fn` with exponential backoff, but only on transient (503) errors. */
async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isRetryable(err) || attempt === MAX_ATTEMPTS) throw err;
      await sleep(400 * attempt);
    }
  }
  throw lastErr;
}

// Task type sharpens retrieval: stored content is embedded as RETRIEVAL_DOCUMENT,
// the live query as RETRIEVAL_QUERY, which separates relevant from irrelevant far
// better than the default general-purpose embedding.
export type EmbedTaskType = 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY';

export async function embed(
  texts: string[],
  taskType: EmbedTaskType = 'RETRIEVAL_DOCUMENT',
): Promise<number[][]> {
  if (texts.length === 0) return [];

  const results: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const response = await withRetry(() =>
      ai.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: batch,
        config: { taskType },
      }),
    );
    const embeddings = response.embeddings;
    if (!embeddings || embeddings.length !== batch.length) {
      throw new Error(
        `Gemini embedding count mismatch: expected ${batch.length}, got ${embeddings?.length ?? 0}`,
      );
    }
    for (const e of embeddings) {
      if (!e.values || e.values.length === 0) {
        throw new Error('Gemini returned an empty embedding');
      }
      results.push(e.values);
    }
  }

  return results;
}

export async function embedOne(
  text: string,
  taskType: EmbedTaskType = 'RETRIEVAL_DOCUMENT',
): Promise<number[]> {
  const [vector] = await embed([text], taskType);
  if (!vector) throw new Error('embedOne returned no vector');
  return vector;
}

export interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

export async function chat(
  systemInstruction: string,
  turns: ChatTurn[],
): Promise<string> {
  const contents = turns.map((t) => ({ role: t.role, parts: [{ text: t.text }] }));
  let lastErr: unknown;

  for (const model of CHAT_MODELS) {
    try {
      return await withRetry(async () => {
        const response = await ai.models.generateContent({
          model,
          config: { systemInstruction },
          contents,
        });
        const text = response.text;
        if (!text) throw new Error('Gemini returned an empty chat response');
        return text;
      });
    } catch (err) {
      lastErr = err;
      // Roll over to the next model when this one is busy or out of quota;
      // surface anything else (bad request, auth, etc.) immediately.
      if (!isRetryable(err) && !isQuotaError(err)) throw err;
      logger.warn(
        { model, err: (err as Error).message },
        'chat model unavailable, falling back',
      );
    }
  }

  throw lastErr ?? new Error('Gemini chat failed');
}
