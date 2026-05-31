import { createApp } from './app.js';
import { connectMongo, disconnectMongo } from './db/mongo.js';
import { env } from './lib/env.js';
import { logger } from './lib/logger.js';

async function main(): Promise<void> {
  await connectMongo();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`server listening on http://localhost:${env.PORT}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received, shutting down`);
    server.close(() => logger.info('http server closed'));
    await disconnectMongo();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((err) => {
  logger.error({ err }, 'failed to start server');
  process.exit(1);
});
