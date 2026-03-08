# Hızlı İşletmem

A business management platform for restaurants, cafes, bars, and similar small businesses. Owners can manage products, tables, orders, payments, and view statistics through a dashboard.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | Turborepo + pnpm |
| Frontend | Next.js 16 (App Router), React 19, TypeScript 5.9 |
| Backend | Fastify 5, TypeScript 5.9 |
| Database | PostgreSQL + Drizzle ORM |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Auth | JWT with HTTP-only cookies (web), Bearer token (future mobile) |
| Validation | Zod |

## Project Structure

```
apps/
  hizli-isletmem-panel/    → Next.js dashboard (frontend)
  api/                     → Fastify API (backend)
packages/
  db/                      → Drizzle ORM schemas & DB client
  eslint-config/           → Shared ESLint config
  typescript-config/       → Shared TypeScript config
docs/                      → Project documentation (database-models.md, etc.)
```

## Key Architectural Decisions

- **Multi-tenancy**: Every DB table has `businessId`. Every query must filter by the authenticated user's `businessId`.
- **Server-first**: Next.js pages are Server Components by default. `"use client"` only at leaf nodes.
- **Layered backend**: Route handlers are thin → business logic in services → DB queries in repository/data layer.
- **No barrel imports**: Never use `index.ts` re-exports. Import directly from source files.
- **Tablet-first design**: Primary viewport is 768px-1024px. Touch targets minimum 44x44px.
- **Turkish UI, English code**: User-facing text is Turkish. All code, comments, docs, and commit messages are English.
- **Soft delete for critical data**: Orders, payments, users use `isActive` or `deletedAt` instead of hard delete.

## Agents

Use specialized agents proactively based on the task:

| Agent | When to use |
|-------|-------------|
| `frontend-expert` | Writing, reviewing, or refactoring code in `apps/hizli-isletmem-panel`. Enforces Next.js server-first, React, and TypeScript best practices. |
| `backend-expert` | Writing, reviewing, or refactoring code in `apps/api` or `packages/db`. Enforces Fastify architecture, Drizzle/PostgreSQL, and TypeScript best practices. |
| `design-expert` | Designing pages, building layouts, creating components, or reviewing visual/UX quality. Enforces tablet-first, accessible, and visually consistent UI. |

## Skills

Available review skills (can be used standalone or are preloaded into agents):

| Skill | Domain |
|-------|--------|
| `/ts-review` | TypeScript clean code & type safety |
| `/react-review` | React component design & hooks |
| `/nextjs-review` | Next.js App Router server-first patterns |
| `/fastify-review` | Fastify API architecture & security |
| `/drizzle-review` | DB schema, query performance, data integrity |
| `/ui-design-review` | Visual hierarchy, spacing, accessibility |
| `/tailwind-review` | Tailwind CSS & shadcn/ui patterns |
| `/smart-commit` | Analyze changes and create grouped conventional commits |

## Code Conventions

- **Files**: `kebab-case.ts`
- **Variables/functions**: `camelCase`
- **Types/interfaces**: `PascalCase`
- **DB columns**: `snake_case`
- **Constants**: `UPPER_SNAKE_CASE`
- **Booleans**: `is/has/can/should` prefix
- **Functions**: max 25 lines, max 3 parameters, single responsibility
- **Files**: max 200 lines, one concept per file
- **Commits**: Conventional Commits format (`feat(scope): description`)
