import { GoogleGenAI } from '@google/genai';
import { env } from './env.js';

export const EMBEDDING_MODEL = 'gemini-embedding-001';
export const CHAT_MODEL = 'gemini-3.5-flash';

const BATCH_SIZE = 100;

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

export async function embed(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const results: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const response = await ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: batch,
    });
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

export async function embedOne(text: string): Promise<number[]> {
  const [vector] = await embed([text]);
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
  const response = await ai.models.generateContent({
    model: CHAT_MODEL,
    config: { systemInstruction },
    contents: turns.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
  });

  const text = response.text;
  if (!text) throw new Error('Gemini returned an empty chat response');
  return text;
}
