import { z } from 'zod';
import { Types } from 'mongoose';

const objectIdSchema = z
  .string()
  .refine((v) => Types.ObjectId.isValid(v), { message: 'Invalid id' });

export const qaIdParamsSchema = z.object({ id: objectIdSchema });

export const createQASchema = z.object({
  question: z.string().trim().min(1, 'Question is required').max(1000),
  answer: z.string().trim().min(1, 'Answer is required').max(10_000),
});

export const updateQASchema = z
  .object({
    question: z.string().trim().min(1).max(1000).optional(),
    answer: z.string().trim().min(1).max(10_000).optional(),
  })
  .refine((d) => d.question !== undefined || d.answer !== undefined, {
    message: 'At least one of question or answer must be provided',
  });

export const listQAQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateQAInput = z.infer<typeof createQASchema>;
export type UpdateQAInput = z.infer<typeof updateQASchema>;
export type ListQAQuery = z.infer<typeof listQAQuerySchema>;
