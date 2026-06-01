import { rateLimit } from 'express-rate-limit';

// Chat answers cost a Gemini embedding + completion call each, so cap how fast
// a single client can spend them. 30 requests / minute / IP.
export const chatRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please wait a moment and try again.',
  },
});
