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

## API

### Health

```
GET /health
```

### Q&A pairs

```
GET    /api/qa?search=&page=1&limit=20
GET    /api/qa/:id
POST   /api/qa            { question, answer }
PUT    /api/qa/:id        { question?, answer? }
DELETE /api/qa/:id
```

Quick smoke test:

```bash
# create
curl -X POST http://localhost:4000/api/qa \
  -H 'Content-Type: application/json' \
  -d '{"question":"What are your hours?","answer":"Mon-Fri 9-5 PT."}'

# list
curl http://localhost:4000/api/qa

# update
curl -X PUT http://localhost:4000/api/qa/<id> \
  -H 'Content-Type: application/json' \
  -d '{"answer":"Mon-Fri 9-6 PT."}'

# delete
curl -X DELETE http://localhost:4000/api/qa/<id>
```

## Layout

```
src/
  app.ts            Express app factory
  server.ts         Entry point (boot order)
  db/mongo.ts       Mongoose connection
  lib/env.ts        Validated env config (zod)
  lib/logger.ts     Pino logger
  lib/http-error.ts HttpError class
  lib/async-handler Wraps async route handlers
  middleware/       validate (zod), error-handler
  models/           Mongoose models
  routes/           Route definitions + per-route zod schemas
  controllers/      Request → service → response
  services/         DB / business logic
```
