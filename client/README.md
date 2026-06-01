# Client

React + Vite + TypeScript front end for the customer-support knowledge product.
Two surfaces:

- **Admin** (`/sources`, `/qa`) — manage the documents and curated Q&A pairs that
  feed the assistant's knowledge base.
- **Chatbot** (`/chat`) — the customer-facing chat surface that answers from that
  knowledge and cites its sources.

Built against the API server in [`../server`](../server). Light + dark themes from
the reference design systems in [`../chatbot-ui`](../chatbot-ui).

## Stack

- React 19, Vite, TypeScript
- React Router, TanStack Query, axios
- Tailwind CSS v4 (design tokens as CSS variables, class-based dark mode)
- Material Symbols icons; Inter / Geist / JetBrains Mono fonts

## Requirements

- Node 20+ (22 recommended), pnpm 10+
- The API server running (see `../server/README.md`). The client defaults to
  `http://localhost:4000`.

## Setup

```bash
cd client
pnpm install
cp .env.example .env   # adjust VITE_API_URL if your server isn't on :4000
pnpm dev
```

The dev server runs on `http://localhost:5173` (the server's default `CORS_ORIGIN`).

## Scripts

| Command        | What it does                             |
| -------------- | ---------------------------------------- |
| `pnpm dev`     | Vite dev server with HMR                 |
| `pnpm build`   | Type-check (`tsc -b`) + production build |
| `pnpm preview` | Serve the production build locally       |
| `pnpm lint`    | ESLint                                   |

## Environment

| Variable       | Required | Default                 | Notes               |
| -------------- | -------- | ----------------------- | ------------------- |
| `VITE_API_URL` | no       | `http://localhost:4000` | Base URL of the API |

## Routes

| Path       | Surface                                          |
| ---------- | ------------------------------------------------ |
| `/sources` | Knowledge Sources — upload, list, status, delete |
| `/qa`      | Q&A Pairs — search, create, edit, delete         |
| `/chat`    | Customer chatbot (standalone, no admin chrome)   |

`/` redirects to `/sources`.

## Theming

Light is the default; a topbar toggle switches to dark. The choice is persisted in
`localStorage` (`kb-theme`) and falls back to the OS `prefers-color-scheme` on first
load. Tokens are defined once in `src/index.css` (`@theme inline` over `--c-*` CSS
variables) and swapped by a `.dark` class on `<html>`.

## Layout

```
src/
  main.tsx                Providers (ErrorBoundary, Theme, Query, Toast, Router)
  App.tsx                 Routes
  index.css               Tailwind v4 + design tokens (light/dark)
  theme/theme.tsx         Theme provider + useTheme
  lib/
    api.ts                axios instance + getErrorMessage
    types.ts              API response shapes
    format.ts             bytes / date / relative-time helpers
    useDebouncedValue.ts  debounce hook
  components/
    ErrorBoundary.tsx
    layout/               AdminLayout, Sidebar, Topbar, PageHeader
    ui/                   Button, Input, Textarea, Modal, ConfirmDialog,
                          StatusBadge, EmptyState, Spinner, Skeleton,
                          Icon, ThemeToggle, toast
  features/
    documents/            Knowledge Sources (api, hooks, StatCards, row, upload)
    qa/                   Q&A Pairs (api, hooks, card, form modal)
    chat/                 Chatbot (api, hooks, bubbles, thinking indicator)
  pages/                  KnowledgeSourcesPage, QAPairsPage, ChatPage
```

## Screenshots

Run `pnpm dev` (with the API server up) and visit the three routes above. The
intended look is captured in the reference mockups under
[`../chatbot-ui`](../chatbot-ui) (light + dark, per screen).
