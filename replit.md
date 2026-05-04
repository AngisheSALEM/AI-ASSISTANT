# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod, `drizzle-zod`
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Build**: esbuild

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/db run push-force` — force-push schema (drops constraints)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Architecture

```
artifacts/
  opere/          — Vite + React frontend (port 24420, preview /)
  api-server/     — Express 5 backend (port 8080)
lib/
  db/             — Drizzle ORM schema + db client
```

### API Routes (Express, port 8080, prefix /api)

**Auth** (no auth required)
- `POST /register` — create user, returns JWT
- `POST /login` — returns JWT

**Organizations** (requireAuth)
- `POST /onboarding` — create org, link to user, return new JWT with orgId
- `GET /organization/:orgId` — get org (name, plan, credits)
- `POST /organization/upgrade` — set plan to PREMIUM
- `POST /payments/recharge` — add credits to org

**Agents**
- `GET /templates` — list agent templates (in-memory, 6 templates)
- `GET /agents/:orgId` — list agents (requireAuth)
- `POST /agents/create-from-template` — create agent from template (requireAuth)
- `DELETE /agents/:agentId` — delete agent (requireAuth)

**Chat**
- `POST /chat` — Opere Copilot chat (requireAuth). Uses GROQ_API_KEY or OPENAI_API_KEY; graceful fallback if unset.
- `GET /chat/history?conversationId=` — fetch messages (requireAuth)
- `POST /chat/:agentId` — chat with a specific agent, deducts 1 credit

### Database Schema (`lib/db/src/schema/opere.ts`)
Tables: `organizations`, `users`, `agents`, `agent_templates`, `conversations`, `messages`

Enums: `plan` (FREE/STANDARD/PREMIUM), `role` (USER/ADMIN), `agent_status` (ACTIVE/INACTIVE/CONFIGURING)

Note: `agents.template_id` is a plain text column (no FK), allowing in-memory template IDs like "t1"–"t6".

### Auth Flow
1. `POST /register` → JWT (no orgId yet)
2. `POST /onboarding` → new JWT with orgId + role=ADMIN
3. Token stored in `localStorage` as `opere_token`, user as `opere_user`
4. `AuthContext` (React context) reads from localStorage on mount

## Artifacts

### Opere — AI Agents Platform (`artifacts/opere`)
- **Kind**: Web (Vite + React)
- **Preview path**: `/`
- **Port**: 24420
- **Stack**: Vite, React, wouter (routing), next-themes (dark/light), framer-motion, lucide-react, Tailwind CSS v4
- **Fonts**: Inter + Fraunces (variable axes) via Google Fonts
- **Theme**: Dark-first with deep-space background (animated glow circles, glass morphism cards)
- **Language**: French

#### Frontend API client (`artifacts/opere/src/lib/api.ts`)
- Resolves API base as `protocol://hostname:8080/api` at runtime
- `api.auth.{register, login}`, `api.org.{create, get, upgrade, recharge}`, `api.agents.{list, templates, createFromTemplate}`, `api.chat.{copilot, history, agent}`
- Token auto-attached via `Authorization: Bearer` header

#### Pages
- `/` — Landing page
- `/login` — Real login (JWT)
- `/register` — Real registration (JWT)
- `/onboarding` — Org creation (real API, updates token with orgId)
- `/copilot` — AI chat (real API, persists conversationId)
- `/:orgId` — Dashboard overview (real org + agents data)
- `/:orgId/agents` — Agent management + template grid (real CRUD)
- `/:orgId/knowledge` — Knowledge base
- `/:orgId/analytics` — Insights & Reports
- `/:orgId/marketplace` — Agent marketplace
- `/:orgId/settings` — Settings
- `/:orgId/integrations` — Integrations
- `/:orgId/billing` — Billing (real recharge + upgrade)
- `/:orgId/thinking` — Thinking Studio

#### Key Components
- `components/Sidebar.tsx` — real org data, logout button
- `lib/AuthContext.tsx` — React context for auth state
- `lib/api.ts` — typed API client

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (required)
- `JWT_SECRET` — JWT signing secret (defaults to dev fallback)
- `GROQ_API_KEY` — Groq AI key for copilot chat (optional, graceful fallback)
- `OPENAI_API_KEY` — OpenAI key fallback for copilot (optional)
