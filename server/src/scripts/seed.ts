import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { connectMongo, disconnectMongo } from '../db/mongo.js';
import { logger } from '../lib/logger.js';
import { DocumentModel } from '../models/document.js';
import { QAPairModel } from '../models/qa-pair.js';
import {
  ingestUpload,
  getDocument,
  deleteDocument,
  listDocuments,
} from '../services/document.service.js';
import { createQAPair } from '../services/qa.service.js';

const seedDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'seed');

const SAMPLE_DOCS = [
  'shipping-and-delivery.txt',
  'returns-and-refunds.txt',
  'billing-and-plans.txt',
];

const SAMPLE_QA = [
  {
    question: 'What hours is customer support available?',
    answer:
      'Our support team is available Monday through Friday, 9:00 AM to 6:00 PM Pacific Time, excluding US public holidays.',
  },
  {
    question: 'Do you offer a student discount?',
    answer:
      'Yes. Students with a valid .edu email get 15% off any membership plan. Email support@acme.example with your school email to receive a code.',
  },
  {
    question: 'Can I change the email address on my account?',
    answer:
      'Yes. Go to Account → Profile, update your email, and confirm via the verification link we send to the new address.',
  },
  {
    question: 'Is there a mobile app?',
    answer:
      'Acme Supply Co. is available as a web app and as native apps for iOS and Android. Search "Acme Supply" in the App Store or Google Play.',
  },
];

const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 90_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function reset(): Promise<void> {
  // Remove existing documents one-by-one so their chunks and R2 objects go too.
  const { items } = await listDocuments({ page: 1, limit: 1000 });
  for (const doc of items) {
    await deleteDocument(doc.id as string);
  }
  await QAPairModel.deleteMany({});
  logger.info(
    { documents: items.length },
    'seed: cleared existing documents and Q&A pairs',
  );
}

async function waitUntilProcessed(id: string): Promise<void> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  for (;;) {
    const doc = await getDocument(id);
    if (doc.status === 'ready') return;
    if (doc.status === 'failed') {
      throw new Error(`processing failed: ${doc.error ?? 'unknown error'}`);
    }
    if (Date.now() > deadline) {
      throw new Error('timed out waiting for processing');
    }
    await sleep(POLL_INTERVAL_MS);
  }
}

async function seedDocuments(): Promise<void> {
  for (const name of SAMPLE_DOCS) {
    const buffer = await readFile(join(seedDir, name));
    const doc = await ingestUpload({
      originalName: name,
      buffer,
      mime: 'text/plain',
      size: buffer.length,
    });
    await waitUntilProcessed(doc.id as string);
    logger.info({ name }, 'seed: document ready');
  }
}

async function seedQAPairs(): Promise<void> {
  for (const qa of SAMPLE_QA) {
    await createQAPair(qa);
  }
  logger.info({ count: SAMPLE_QA.length }, 'seed: Q&A pairs created');
}

async function main(): Promise<void> {
  const shouldReset = process.argv.includes('--reset');

  await connectMongo();
  try {
    if (shouldReset) await reset();
    await seedDocuments();
    await seedQAPairs();

    const [docCount, qaCount] = await Promise.all([
      DocumentModel.countDocuments({ status: 'ready' }),
      QAPairModel.countDocuments({}),
    ]);
    logger.info(
      { documents: docCount, qaPairs: qaCount },
      'seed: complete — try POST /api/chat',
    );
  } finally {
    await disconnectMongo();
  }
}

main().catch((err) => {
  logger.error({ err }, 'seed failed');
  process.exit(1);
});
