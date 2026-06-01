import { z } from 'zod';
import { Types } from 'mongoose';
import { DOCUMENT_STATUSES } from '../models/document.js';

const objectIdSchema = z
  .string()
  .refine((v) => Types.ObjectId.isValid(v), { message: 'Invalid id' });

export const documentIdParamsSchema = z.object({ id: objectIdSchema });

export const listDocumentsQuerySchema = z.object({
  status: z.enum(DOCUMENT_STATUSES).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type ListDocumentsQuery = z.infer<typeof listDocumentsQuerySchema>;
