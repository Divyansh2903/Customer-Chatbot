import { Router } from 'express';
import * as documents from '../controllers/document.controller.js';
import { documentUpload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../lib/async-handler.js';
import {
  documentIdParamsSchema,
  listDocumentsQuerySchema,
} from './document.schemas.js';

export const documentRouter = Router();

documentRouter.get(
  '/',
  validate(listDocumentsQuerySchema, 'query'),
  asyncHandler(documents.list),
);

documentRouter.get(
  '/:id',
  validate(documentIdParamsSchema, 'params'),
  asyncHandler(documents.get),
);

documentRouter.post('/', documentUpload, asyncHandler(documents.upload));

documentRouter.delete(
  '/:id',
  validate(documentIdParamsSchema, 'params'),
  asyncHandler(documents.remove),
);
