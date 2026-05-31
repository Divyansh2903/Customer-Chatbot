import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const qaPairSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 1000,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 10_000,
    },
    embedding: {
      type: [Number],
      default: undefined,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

qaPairSchema.index({ question: 'text', answer: 'text' });

export type QAPair = InferSchemaType<typeof qaPairSchema>;
export type QAPairDoc = HydratedDocument<QAPair>;

export const QAPairModel = model<QAPair>('QAPair', qaPairSchema);
