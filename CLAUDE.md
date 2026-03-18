# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development (recommended via Docker):**
```bash
docker compose up --build   # Run with hot reload at http://localhost:3001
docker compose down         # Stop
```

**Local development:**
```bash
npm install                 # Install deps
npm run dev                 # Next.js dev server at http://localhost:3000
```

**Other:**
```bash
npm run build               # Production build
npm run lint                # ESLint
npm audit                   # Check for known vulnerabilities
```

## Architecture

**Stack:** Next.js 14 (App Router) + TypeScript. Pure client-side app — all pages use `"use client"`. No server-side data fetching.

**Auth:** JWT tokens stored in `localStorage` via `lib/auth.ts` (`epn_admin_access_token`, `epn_admin_refresh_token`). Login via email OTP at `/login`. Auth guard is `AdminGuard` — checks for token on mount, redirects to `/login` if absent.

**API layer:** All backend calls go through `lib/api.ts` which wraps `fetch` with auth headers. Backend URL from `env.backendUrl` (`NEXT_PUBLIC_BACKEND_URL`). Always import env vars via `import { env } from "@/lib/env"`, never from `process.env` directly.

**Layout:** Admin pages use a route group `(admin)` with a sidebar layout (`AdminGuard` + `Sidebar`). The `/login` page sits outside this group (no sidebar).

**Route structure (`app/`):**
- `/` — dashboard (wallet stats)
- `/login` — email OTP login (outside admin layout)
- `/users`, `/users/[userId]` — user management
- `/devices` — device management
- `/subscriptions` — user subscription management
- `/wallets` — wallet management + stats
- `/vouchers` — voucher CRUD
- `/api-keys` — API key management

**Admin API endpoints** (all under `/api/admin/`): users, devices, user-subscriptions, wallets (+ stats/daily, stats/summary, stats/top-users), vouchers, api-keys, remnawave sync. Full list and schemas are in `openapi.json` in the sibling `epn-frontend` repo.

**Types:** All admin API response shapes are in `types/admin.ts`.

**Path alias:** `@/` maps to the repo root (configured in `tsconfig.json`).

**Styling:** Custom CSS with CSS variables in `globals.css`. Dark theme. Admin-specific classes: `.admin-layout`, `.admin-sidebar`, `.admin-table`, `.stat-card`, `.badge`, `.pagination`. No CSS framework.

**Environment setup:** Copy `.env.example` to `.env.local`. Only `NEXT_PUBLIC_BACKEND_URL` is required.

## Patterns from epn-frontend

This project mirrors the architecture of the sibling `epn-frontend` project:
- Same `fetchApi` wrapper pattern in `lib/api.ts`
- Same `lib/auth.ts` token management (different localStorage keys to avoid collisions)
- Same `lib/env.ts` pattern for environment variables
- Same Next.js 14 App Router + `"use client"` everywhere approach
- Same Docker/standalone build pipeline
