import type { Request, Response } from 'express';
import * as qaService from '../services/qa.service.js';
import type { QAPairDoc } from '../models/qa-pair.js';
import type {
  CreateQAInput,
  ListQAQuery,
  UpdateQAInput,
} from '../routes/qa.schemas.js';

function serialize(doc: QAPairDoc) {
  return {
    id: doc.id as string,
    question: doc.question,
    answer: doc.answer,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function list(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as ListQAQuery;
  const result = await qaService.listQAPairs(query);
  res.json({
    items: result.items.map(serialize),
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
}

export async function get(req: Request, res: Response): Promise<void> {
  const doc = await qaService.getQAPair(req.params.id as string);
  res.json(serialize(doc));
}

export async function create(req: Request, res: Response): Promise<void> {
  const input = req.body as CreateQAInput;
  const doc = await qaService.createQAPair(input);
  res.status(201).json(serialize(doc));
}

export async function update(req: Request, res: Response): Promise<void> {
  const input = req.body as UpdateQAInput;
  const doc = await qaService.updateQAPair(req.params.id as string, input);
  res.json(serialize(doc));
}

export async function remove(req: Request, res: Response): Promise<void> {
  await qaService.deleteQAPair(req.params.id as string);
  res.status(204).end();
}
