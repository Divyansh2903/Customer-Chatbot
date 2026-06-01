import { chat, type ChatTurn } from '../lib/gemini.js';
import { retrieve, type SourceType } from './retrieval.service.js';

// Keep prompt size bounded; only the most recent turns matter for follow-ups.
const MAX_HISTORY_TURNS = 8;

const SYSTEM_RULES =
  'You are a customer-support assistant. Answer the user\'s question using ONLY ' +
  'the context provided below. If the context does not contain the answer, say ' +
  'you don\'t have enough information to answer — do not guess or rely on outside ' +
  'knowledge. Keep replies concise, friendly, and direct.';

const NO_CONTEXT_REPLY =
  "I don't have enough information in my knowledge base to answer that. " +
  'Try rephrasing your question, or reach out to support for more help.';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ChatSource {
  type: SourceType;
  title: string;
  snippet: string;
}

export interface ChatResult {
  reply: string;
  sources: ChatSource[];
}

function dedupeSources(sources: ChatSource[]): ChatSource[] {
  const seen = new Set<string>();
  const out: ChatSource[] = [];
  for (const s of sources) {
    const key = `${s.type}:${s.title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

export async function answerQuestion(
  message: string,
  history: ChatMessage[] = [],
): Promise<ChatResult> {
  const retrieved = await retrieve(message);

  // Nothing relevant — skip the model call and decline directly.
  if (retrieved.length === 0) {
    return { reply: NO_CONTEXT_REPLY, sources: [] };
  }

  const contextBlock = retrieved
    .map((r, i) => {
      const label = r.type === 'qa' ? 'Curated Q&A' : `Document: ${r.title}`;
      return `[${i + 1}] (${label})\n${r.content}`;
    })
    .join('\n\n');

  const systemInstruction = `${SYSTEM_RULES}\n\nContext:\n${contextBlock}`;

  const turns: ChatTurn[] = [
    ...history.slice(-MAX_HISTORY_TURNS).map((m) => ({
      role: m.role,
      text: m.content,
    })),
    { role: 'user', text: message },
  ];

  const reply = await chat(systemInstruction, turns);

  const sources = dedupeSources(
    retrieved.map((r) => ({ type: r.type, title: r.title, snippet: r.snippet })),
  );

  return { reply, sources };
}
