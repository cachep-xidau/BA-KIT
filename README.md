# BA Kit

BA Kit la monorepo full-stack cho workflow Business Analysis, gom API, Web UI, shared types va AI engine.

## Tech Stack

- Node.js + TypeScript
- pnpm workspaces + Turbo
- Express (API)
- Next.js (Web)
- Prisma (database)

## Quick Start

```bash
git clone https://github.com/cachep-xidau/ba-kit.git
cd ba-kit
corepack enable
corepack prepare pnpm@9.15.0 --activate
pnpm install
cp .env.example .env
pnpm dev
```

## Default Endpoints

- Web: `http://localhost:3000`
- API: `http://localhost:3001`
- Health: `http://localhost:3001/api/health`

## Common Commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm type-check
```

API package:

```bash
cd apps/api
pnpm test
pnpm test:coverage
```

## Project Structure

```text
apps/
  api/        # Express API + Prisma
  web/        # Next.js frontend
packages/
  shared/     # Shared schemas/types
  ai-engine/  # AI routing/providers
docs/         # Project documentation
```

## Documentation

- Setup va development guide: `docs/development-guide.md`
- Installation + usage guideline: `docs/installation-and-usage-guideline.md`
- Docs index: `docs/index.md`

## Security Notes

- Khong commit secrets (`.env`, `.env.local`, `apps/api/.env`)
- Khong hardcode token/API keys trong source code
