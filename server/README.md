# Server

Node + Express + TypeScript API backing the customer support chatbot. MongoDB Atlas for storage, Gemini for embeddings and chat completion.

## Requirements

- Node 20+
- pnpm 10+
- A MongoDB Atlas cluster (the free tier is enough)
- A Gemini API key from [Google AI Studio](https://aistudio.google.com)

## Setup

```bash
cd server
pnpm install
cp .env.example .env
# fill in MONGODB_URI and GEMINI_API_KEY
pnpm dev
```

The server starts on `http://localhost:4000`. Hit `GET /health` to confirm it's up and connected to Mongo.

## Scripts

| Command          | What it does                                    |
| ---------------- | ----------------------------------------------- |
| `pnpm dev`       | Watch mode with `tsx`                           |
| `pnpm build`     | Compile TypeScript to `dist/`                   |
| `pnpm start`     | Run the compiled build                          |
| `pnpm typecheck` | Type-check without emitting                     |

## Environment

| Variable         | Required | Default                  | Notes                                  |
| ---------------- | -------- | ------------------------ | -------------------------------------- |
| `PORT`           | no       | `4000`                   |                                        |
| `NODE_ENV`       | no       | `development`            |                                        |
| `MONGODB_URI`    | yes      | —                        | Atlas connection string                |
| `GEMINI_API_KEY` | yes      | —                        | Used in later features                 |
| `CORS_ORIGIN`    | no       | `http://localhost:5173`  | Vite dev server origin                 |

## Layout

```
src/
  app.ts            Express app factory
  server.ts         Entry point (boot order)
  db/mongo.ts       Mongoose connection
  lib/env.ts        Validated env config (zod)
  lib/logger.ts     Pino logger
  lib/http-error.ts HttpError class
  middleware/       Cross-cutting middleware
  routes/           Route modules
```
