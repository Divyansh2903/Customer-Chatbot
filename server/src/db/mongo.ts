import mongoose from 'mongoose';
import { env } from '../lib/env.js';
import { logger } from '../lib/logger.js';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

export async function connectMongo(): Promise<void> {
  mongoose.set('strictQuery', true);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10_000,
      });
      logger.info({ db: mongoose.connection.name }, 'mongo: connected');
      attachConnectionListeners();
      return;
    } catch (err) {
      const isLast = attempt === MAX_RETRIES;
      logger.error(
        { attempt, err: (err as Error).message },
        `mongo: connection failed${isLast ? '' : ', retrying'}`,
      );
      if (isLast) throw err;
      await sleep(RETRY_DELAY_MS);
    }
  }
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
  logger.info('mongo: disconnected');
}

function attachConnectionListeners(): void {
  mongoose.connection.on('error', (err) => {
    logger.error({ err: err.message }, 'mongo: connection error');
  });
  mongoose.connection.on('disconnected', () => {
    logger.warn('mongo: disconnected');
  });
  mongoose.connection.on('reconnected', () => {
    logger.info('mongo: reconnected');
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
