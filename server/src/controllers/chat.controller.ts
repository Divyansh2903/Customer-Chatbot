import type { Request, Response } from 'express';
import * as chatService from '../services/chat.service.js';
import type { ChatInput } from '../routes/chat.schemas.js';

export async function send(req: Request, res: Response): Promise<void> {
  const input = req.body as ChatInput;
  const result = await chatService.answerQuestion(input.message, input.history);
  res.json(result);
}
