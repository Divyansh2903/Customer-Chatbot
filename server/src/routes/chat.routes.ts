import { Router } from 'express';
import * as chat from '../controllers/chat.controller.js';
import { validate } from '../middleware/validate.js';
import { chatRateLimit } from '../middleware/rate-limit.js';
import { asyncHandler } from '../lib/async-handler.js';
import { chatSchema } from './chat.schemas.js';

export const chatRouter = Router();

chatRouter.post(
  '/',
  chatRateLimit,
  validate(chatSchema, 'body'),
  asyncHandler(chat.send),
);
