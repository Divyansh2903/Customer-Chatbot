import { QAPairModel, type QAPairDoc } from '../models/qa-pair.js';
import { HttpError } from '../lib/http-error.js';
import { embedOne } from '../lib/gemini.js';
import type {
  CreateQAInput,
  ListQAQuery,
  UpdateQAInput,
} from '../routes/qa.schemas.js';

function embedInputFor(question: string, answer: string): string {
  return `${question}\n${answer}`;
}

export interface PaginatedQA {
  items: QAPairDoc[];
  total: number;
  page: number;
  limit: number;
}

export async function listQAPairs(query: ListQAQuery): Promise<PaginatedQA> {
  const { page, limit, search } = query;
  const filter = search
    ? {
        $or: [
          { question: { $regex: search, $options: 'i' } },
          { answer: { $regex: search, $options: 'i' } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    QAPairModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec(),
    QAPairModel.countDocuments(filter),
  ]);

  return { items, total, page, limit };
}

export async function getQAPair(id: string): Promise<QAPairDoc> {
  const doc = await QAPairModel.findById(id).exec();
  if (!doc) throw HttpError.notFound('Q&A pair not found');
  return doc;
}

export async function createQAPair(input: CreateQAInput): Promise<QAPairDoc> {
  const embedding = await embedOne(embedInputFor(input.question, input.answer));
  return QAPairModel.create({ ...input, embedding });
}

export async function updateQAPair(
  id: string,
  input: UpdateQAInput,
): Promise<QAPairDoc> {
  const doc = await QAPairModel.findById(id).exec();
  if (!doc) throw HttpError.notFound('Q&A pair not found');

  if (input.question !== undefined) doc.question = input.question;
  if (input.answer !== undefined) doc.answer = input.answer;

  doc.embedding = await embedOne(embedInputFor(doc.question, doc.answer));

  await doc.save();
  return doc;
}

export async function deleteQAPair(id: string): Promise<void> {
  const result = await QAPairModel.findByIdAndDelete(id).exec();
  if (!result) throw HttpError.notFound('Q&A pair not found');
}
