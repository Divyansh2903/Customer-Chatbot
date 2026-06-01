import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

export const DOCUMENT_STATUSES = ['processing', 'ready', 'failed'] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

const documentSchema = new Schema(
  {
    originalName: { type: String, required: true, trim: true, maxlength: 512 },
    objectKey: { type: String, required: true, unique: true },
    mime: { type: String, required: true },
    size: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: DOCUMENT_STATUSES,
      default: 'processing',
      required: true,
      index: true,
    },
    error: { type: String, default: undefined },
    extractedText: { type: String, default: undefined, select: false },
    textLength: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type DocumentRecord = InferSchemaType<typeof documentSchema>;
export type DocumentRecordDoc = HydratedDocument<DocumentRecord>;

export const DocumentModel = model<DocumentRecord>('Document', documentSchema);
