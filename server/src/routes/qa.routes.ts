import { Router } from 'express';
import * as qa from '../controllers/qa.controller.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../lib/async-handler.js';
import {
  createQASchema,
  listQAQuerySchema,
  qaIdParamsSchema,
  updateQASchema,
} from './qa.schemas.js';

export const qaRouter = Router();

qaRouter.get(
  '/',
  validate(listQAQuerySchema, 'query'),
  asyncHandler(qa.list),
);

qaRouter.get(
  '/:id',
  validate(qaIdParamsSchema, 'params'),
  asyncHandler(qa.get),
);

qaRouter.post(
  '/',
  validate(createQASchema, 'body'),
  asyncHandler(qa.create),
);

qaRouter.put(
  '/:id',
  validate(qaIdParamsSchema, 'params'),
  validate(updateQASchema, 'body'),
  asyncHandler(qa.update),
);

qaRouter.delete(
  '/:id',
  validate(qaIdParamsSchema, 'params'),
  asyncHandler(qa.remove),
);
