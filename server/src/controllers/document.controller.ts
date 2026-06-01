import type { Request, Response } from 'express';
import * as documentService from '../services/document.service.js';
import { HttpError } from '../lib/http-error.js';
import { SUPPORTED_MIME_TYPES } from '../middleware/upload.js';
import type { DocumentRecordDoc } from '../models/document.js';
import type { ListDocumentsQuery } from '../routes/document.schemas.js';

function serialize(doc: DocumentRecordDoc) {
  return {
    id: doc.id as string,
    originalName: doc.originalName,
    mime: doc.mime,
    typeLabel: SUPPORTED_MIME_TYPES[doc.mime] ?? doc.mime,
    size: doc.size,
    status: doc.status,
    error: doc.error,
    textLength: doc.textLength,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function list(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as ListDocumentsQuery;
  const result = await documentService.listDocuments(query);
  res.json({
    items: result.items.map(serialize),
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
}

export async function get(req: Request, res: Response): Promise<void> {
  const doc = await documentService.getDocument(req.params.id as string);
  res.json(serialize(doc));
}

export async function upload(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    throw HttpError.badRequest('No file uploaded (expected field name "file")');
  }

  const doc = await documentService.ingestUpload({
    originalName: req.file.originalname,
    buffer: req.file.buffer,
    mime: req.file.mimetype,
    size: req.file.size,
  });

  res.status(202).json(serialize(doc));
}

export async function remove(req: Request, res: Response): Promise<void> {
  await documentService.deleteDocument(req.params.id as string);
  res.status(204).end();
}
