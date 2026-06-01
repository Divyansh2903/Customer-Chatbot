# Server

Node + Express + TypeScript API backing the customer support chatbot. MongoDB Atlas for metadata, Cloudflare R2 for uploaded files, Gemini for embeddings and chat completion.

## Requirements

- Node 20+
- pnpm 10+
- A MongoDB Atlas cluster (the free tier is enough)
- A Cloudflare R2 bucket + an API token with read/write access
- A Gemini API key from [Google AI Studio](https://aistudio.google.com)

### Creating an R2 bucket

1. Cloudflare dashboard → R2 → **Create bucket** (any name works).
2. R2 → **Manage R2 API Tokens** → **Create API Token** with *Object Read & Write* scoped to that bucket.
3. Copy the **Access Key ID** and **Secret Access Key**. The **Account ID** is shown in the R2 sidebar.

## Setup

```bash
cd server
pnpm install
cp .env.example .env
# fill in MONGODB_URI, GEMINI_API_KEY, and the four R2_* values
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

| Variable               | Required | Default                  | Notes                                  |
| ---------------------- | -------- | ------------------------ | -------------------------------------- |
| `PORT`                 | no       | `4000`                   |                                        |
| `NODE_ENV`             | no       | `development`            |                                        |
| `MONGODB_URI`          | yes      | —                        | Atlas connection string                |
| `GEMINI_API_KEY`       | yes      | —                        | Used in later features                 |
| `CORS_ORIGIN`          | no       | `http://localhost:5173`  | Vite dev server origin                 |
| `R2_ACCOUNT_ID`        | yes      | —                        | Cloudflare account id                  |
| `R2_ACCESS_KEY_ID`     | yes      | —                        | R2 API token access key                |
| `R2_SECRET_ACCESS_KEY` | yes      | —                        | R2 API token secret                    |
| `R2_BUCKET`            | yes      | —                        | Bucket name                            |

## API

### Health

```
GET /health
```

### Documents

```
GET    /api/documents?status=&page=1&limit=20
GET    /api/documents/:id
POST   /api/documents     multipart/form-data, field name: "file"
DELETE /api/documents/:id
```

Supported types: **PDF, DOCX, XLSX, CSV, TXT**. Max upload size: **25 MB**.

Uploads are streamed straight into Cloudflare R2 (object key `documents/<uuid>.<ext>`)
and processed asynchronously: extract text → chunk → embed via Gemini → insert
`Chunk` rows. The `POST` response is `202 Accepted` with the document in
`processing` status — poll `GET /api/documents/:id` until `status` is `ready`
(or `failed` with an `error` field). Deleting a document removes its chunks
and the R2 object too.

Q&A pairs are embedded synchronously on create/update (stored on the
`QAPair.embedding` field) so `POST`/`PUT` requests will block on a Gemini
call (typically ~300 ms).

```bash
# upload
curl -X POST http://localhost:4000/api/documents \
  -F 'file=@./pricing.pdf'

# list
curl http://localhost:4000/api/documents

# delete
curl -X DELETE http://localhost:4000/api/documents/<id>
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
  lib/r2.ts         Cloudflare R2 client (put/delete)
  lib/gemini.ts     Google GenAI wrapper (embed, embedOne)
  lib/chunking.ts   Sentence-aware text chunker
  middleware/       validate (zod), error-handler
  models/           Mongoose models
  routes/           Route definitions + per-route zod schemas
  controllers/      Request → service → response
  services/         DB / business logic
  services/parsers/ Per-MIME text extractors + dispatcher
```
