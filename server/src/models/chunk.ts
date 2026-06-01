import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const chunkSchema = new Schema(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    position: { type: Number, required: true, min: 0 },
    content: { type: String, required: true },
    embedding: { type: [Number], required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type ChunkRecord = InferSchemaType<typeof chunkSchema>;
export type ChunkRecordDoc = HydratedDocument<ChunkRecord>;

export const ChunkModel = model<ChunkRecord>('Chunk', chunkSchema);
