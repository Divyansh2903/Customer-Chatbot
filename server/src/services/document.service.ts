import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { DocumentModel, type DocumentRecordDoc } from '../models/document.js';
import { ChunkModel } from '../models/chunk.js';
import { HttpError } from '../lib/http-error.js';
import { logger } from '../lib/logger.js';
import { deleteObject, putObject } from '../lib/r2.js';
import { chunkText } from '../lib/chunking.js';
import { embed } from '../lib/gemini.js';
import { extractTextFromBuffer } from './parsers/index.js';

export interface ListDocumentsQuery {
  page: number;
  limit: number;
  status?: 'processing' | 'ready' | 'failed';
}

export interface PaginatedDocuments {
  items: DocumentRecordDoc[];
  total: number;
  page: number;
  limit: number;
}

export async function listDocuments(
  query: ListDocumentsQuery,
): Promise<PaginatedDocuments> {
  const { page, limit, status } = query;
  const filter = status ? { status } : {};

  const [items, total] = await Promise.all([
    DocumentModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec(),
    DocumentModel.countDocuments(filter),
  ]);

  return { items, total, page, limit };
}

export async function getDocument(id: string): Promise<DocumentRecordDoc> {
  const doc = await DocumentModel.findById(id).exec();
  if (!doc) throw HttpError.notFound('Document not found');
  return doc;
}

export interface UploadedFile {
  originalName: string;
  buffer: Buffer;
  mime: string;
  size: number;
}

export async function ingestUpload(file: UploadedFile): Promise<DocumentRecordDoc> {
  const objectKey = `documents/${randomUUID()}${extname(file.originalName).toLowerCase()}`;

  await putObject(objectKey, file.buffer, file.mime);

  const doc = await DocumentModel.create({
    originalName: file.originalName,
    objectKey,
    mime: file.mime,
    size: file.size,
    status: 'processing',
  });

  // Fire-and-forget extraction using the buffer already in memory.
  void processDocument(doc.id as string, file.buffer);

  return doc;
}

export async function deleteDocument(id: string): Promise<void> {
  const doc = await DocumentModel.findById(id).exec();
  if (!doc) throw HttpError.notFound('Document not found');

  await DocumentModel.deleteOne({ _id: doc._id }).exec();
  await ChunkModel.deleteMany({ documentId: doc._id }).exec();
  await safeDeleteObject(doc.objectKey);
}

async function processDocument(
  documentId: string,
  buffer: Buffer,
): Promise<void> {
  const doc = await DocumentModel.findById(documentId).exec();
  if (!doc) {
    logger.warn({ documentId }, 'processDocument: document missing');
    return;
  }

  try {
    const text = await extractTextFromBuffer(buffer, doc.mime);
    if (!text) throw new Error('No text extracted from document');

    const chunks = chunkText(text);
    if (chunks.length === 0) throw new Error('Chunking produced no chunks');

    const embeddings = await embed(chunks);

    // Replace any pre-existing chunks (covers re-processing).
    await ChunkModel.deleteMany({ documentId: doc._id }).exec();
    await ChunkModel.insertMany(
      chunks.map((content, position) => ({
        documentId: doc._id,
        position,
        content,
        embedding: embeddings[position],
      })),
    );

    doc.extractedText = text;
    doc.textLength = text.length;
    doc.status = 'ready';
    doc.error = undefined;
    await doc.save();
    logger.info(
      { documentId, mime: doc.mime, chars: text.length, chunks: chunks.length },
      'document processed',
    );
  } catch (err) {
    doc.status = 'failed';
    doc.error = (err as Error).message || 'Processing failed';
    await doc.save();
    logger.error(
      { documentId, err: doc.error },
      'document processing failed',
    );
  }
}

async function safeDeleteObject(key: string): Promise<void> {
  try {
    await deleteObject(key);
  } catch (err) {
    logger.warn({ key, err: (err as Error).message }, 'r2 delete failed');
  }
}
