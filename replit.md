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
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### Opere — AI Agents Platform (`artifacts/opere`)
- **Kind**: Web (Vite + React)
- **Preview path**: `/`
- **Port**: 24420
- **Stack**: Vite, React, wouter (routing), next-themes (dark/light), framer-motion (animations), lucide-react (icons), Tailwind CSS v4, clsx + tailwind-merge
- **Fonts**: Inter + Fraunces (variable axes) via Google Fonts
- **Theme**: Dark-first with deep-space background (animated glow circles, glass morphism cards)
- **Language**: French (SaaS platform for AI agents)

#### Pages
- `/` — Landing page (hero, catalog, features, pricing)
- `/login` — Login with email/password + Google OAuth
- `/register` — Registration form
- `/onboarding` — Org creation step with FloatingChatbot
- `/copilot` — Full AI chat interface with step progress bar
- `/:orgId` — Dashboard overview (stats, bar chart, connections, live feed)
- `/:orgId/agents` — Agent management + template selection grid
- `/:orgId/knowledge` — Knowledge base (docs, URL scraping, FAQ, cloud sync)
- `/:orgId/analytics` — Insights & Reports (bar chart, donut chart, history)
- `/:orgId/marketplace` — Searchable/filterable agent marketplace
- `/:orgId/settings` — Profile, theme, notifications, security
- `/:orgId/integrations` — Integration cards (WhatsApp, Email, etc.)
- `/:orgId/billing` — Plan comparison + credit history
- `/:orgId/thinking` — Thinking Studio (AI reasoning trace viewer)

#### Key Components
- `components/Sidebar.tsx` — Dashboard sidebar with credit gauge + upgrade CTA
- `components/ui/PremiumGlassCard.tsx` — Mouse-tracking glass card with framer-motion
- `components/ui/CreditGauge.tsx` — Animated credit progress bar with tooltip
- `components/FloatingChatbot.tsx` — Floating chat bubble widget
- `components/RechargeButton.tsx` — Credit recharge action button
