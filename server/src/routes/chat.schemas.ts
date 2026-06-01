import { z } from 'zod';

const chatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string().trim().min(1).max(10_000),
});

export const chatSchema = z.object({
  message: z.string().trim().min(1, 'Message is required').max(2000),
  history: z.array(chatMessageSchema).max(50).optional(),
});

export type ChatInput = z.infer<typeof chatSchema>;
