import { Router } from 'express';
import mongoose from 'mongoose';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  const mongoState = mongoose.connection.readyState;
  const mongoStatus =
    mongoState === 1 ? 'connected' : mongoState === 2 ? 'connecting' : 'disconnected';

  res.json({
    ok: true,
    uptime: process.uptime(),
    mongo: mongoStatus,
    timestamp: new Date().toISOString(),
  });
});
