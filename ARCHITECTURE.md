# MorphDB — Architecture & Product Documentation

> **Last Updated**: 2026-02-24
> **Version**: 1.0.0 (Developer Beta)
> **Maintainer**: codeman403

---

## TL;DR

MorphDB is an AI-powered database migration co-pilot that translates SQL between dialects (SQL Server, Oracle, MySQL, PostgreSQL → Snowflake/dbt, PostgreSQL, BigQuery, Redshift). Built as a SaaS with Next.js 16, Supabase Auth, Prisma 7, Stripe, and OpenAI GPT-4o-mini.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Directory Structure](#directory-structure)
4. [Features](#features)
5. [API Reference](#api-reference)
6. [Database Schema](#database-schema)
7. [Authentication Flow](#authentication-flow)
8. [AI Migration Engine](#ai-migration-engine)
9. [Security](#security)
10. [Deployment](#deployment)
11. [Environment Variables](#environment-variables)
12. [Upcoming Updates](#upcoming-updates)
13. [Changelog](#changelog)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Client (Browser)                  │
│  Next.js 16 App Router • React 19 • Framer Motion   │
└──────────────────────┬──────────────────────────────┘
                       │
              ┌────────▼────────┐
              │   Vercel Edge    │
              │   (Middleware)   │
              │  Session Refresh │
              └────────┬────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
  ┌─────▼─────┐ ┌─────▼─────┐ ┌─────▼─────┐
  │  Auth API  │ │ Migrate   │ │  Admin    │
  │  Routes    │ │ API       │ │  API      │
  │ /api/auth  │ │ /api/     │ │ /api/     │
  │            │ │ migrate   │ │ admin     │
  └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
        │              │              │
  ┌─────▼─────┐  ┌────▼────┐  ┌─────▼─────┐
  │ Supabase   │  │ OpenAI  │  │  Prisma   │
  │ Auth       │  │ GPT-4o  │  │  + Pool   │
  │ (SSR)      │  │ -mini   │  │           │
  └─────┬─────┘  └─────────┘  └─────┬─────┘
        │                            │
        └────────────┬───────────────┘
                     │
            ┌────────▼────────┐
            │   Supabase      │
            │   PostgreSQL    │
            │  (via Pooler)   │
            └─────────────────┘
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js (App Router) | 16.1.6 |
| **UI** | React | 19.2.3 |
| **Styling** | Tailwind CSS | 4.x |
| **Animations** | Framer Motion | 12.x |
| **Icons** | Lucide React | 0.575.x |
| **ORM** | Prisma (with pg adapter) | 7.4.1 |
| **Database** | Supabase PostgreSQL | - |
| **Auth** | Supabase SSR | 0.8.x |
| **Payments** | Stripe | 20.x |
| **AI** | OpenAI (GPT-4o-mini) | latest |
| **Hosting** | Vercel | - |

---

## Directory Structure

```
hackathon-proj/
├── prisma/
│   └── schema.prisma          # Database models
├── prisma.config.ts            # Prisma 7 config (connection URL)
├── src/
│   ├── app/
│   │   ├── page.tsx            # Landing page (Hero, Features, How It Works, Pricing, Footer)
│   │   ├── layout.tsx          # Root layout
│   │   ├── login/page.tsx      # Sign In / Sign Up page
│   │   ├── waitlist/page.tsx   # Waitlist signup page
│   │   ├── demo/page.tsx       # AI Migration Demo (interactive)
│   │   ├── dashboard/
│   │   │   ├── page.tsx        # User dashboard
│   │   │   └── admin/page.tsx  # Admin dashboard (protected)
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── signin/route.ts
│   │       │   ├── signup/route.ts
│   │       │   └── signout/route.ts
│   │       ├── migrate/route.ts      # AI SQL translation endpoint
│   │       ├── waitlist/route.ts
│   │       ├── admin/stats/route.ts  # Admin data endpoint
│   │       └── stripe/
│   │           ├── checkout/route.ts
│   │           └── webhook/route.ts
│   ├── lib/
│   │   ├── prisma.ts           # Prisma client (serverless-optimized)
│   │   ├── rate-limit.ts       # In-memory rate limiter
│   │   ├── ai/
│   │   │   └── migrate.ts      # AI translation engine (OpenAI)
│   │   └── supabase/
│   │       └── server.ts       # Supabase server client
│   ├── proxy.ts                # Middleware (session refresh + route protection)
│   └── generated/prisma/       # Auto-generated Prisma client (gitignored)
├── ARCHITECTURE.md             # This file
├── ARCHITECTURE.md             # This file (architecture, features, API, deployment)
└── package.json
```

---

## Features

### 🏠 Landing Page
- Hero section with gradient text and CTA
- Features grid (AI Translation, Logic Preservation, dbt Output)
- "How It Works" pipeline visualization
- Pricing tiers (Design Partner / Pro / Enterprise)
- Footer with links
- Smooth scroll navigation with Framer Motion animations

### 🤖 AI Migration Engine (Phase 3)
- **Real AI-powered** SQL dialect translation via OpenAI GPT-4o-mini
- **Source dialects**: SQL Server (T-SQL), Oracle (PL/SQL), MySQL, PostgreSQL
- **Target dialects**: Snowflake (dbt Jinja), PostgreSQL, BigQuery, Redshift
- Editable SQL input with character count
- Preset examples (NULL Handling, Date Functions, TOP→LIMIT, Oracle→Postgres)
- Translation stats: duration, transformations count, tokens used, warnings
- Copy-to-clipboard for output
- Rate limited: 10 translations/min per IP

### 🔐 Authentication
- Email/password auth via Supabase Auth (SSR)
- Sign Up with name + company fields
- Sign In with login logging (IP, Country, User-Agent, Browser)
- Sign Out (supports both GET and POST)
- Middleware session refresh on all routes (prevents silent sign-outs)
- Protected `/dashboard` routes (redirect to `/login` if unauthenticated)

### 📊 Admin Dashboard
- Stat cards: Waitlist count, Login events, Total users, Subscriptions
- Tabbed data tables: Waitlist entries, Login logs, User profiles
- Protected by `ADMIN_EMAILS` environment variable
- Refresh button for live data
- Accessible at `/dashboard/admin`

### 📝 Waitlist
- Email + Name + Company capture
- Duplicate detection (409 if already on waitlist)
- Stored in `waitlist_entries` table

### 💳 Stripe Integration
- Checkout session creation
- Webhook handler for subscription events
- Lazy Stripe initialization (Vercel-compatible)

### 🛡️ Security
- **Rate Limiting**: Per-IP sliding window on all mutation endpoints
  - Sign In: 5 req/min
  - Sign Up: 3 req/min
  - Waitlist: 3 req/min
  - AI Migrate: 10 req/min
- Input validation on all API routes
- SQL input length cap (10,000 chars)
- Admin panel email-gated access

---

## API Reference

### `POST /api/migrate`
Translate SQL between dialects using AI.

**Request:**
```json
{
  "sql": "SELECT ISNULL(name, 'Unknown') FROM [dbo].[Users]",
  "sourceDialect": "sql_server",
  "targetDialect": "snowflake_dbt"
}
```

**Response (200):**
```json
{
  "translatedSql": "select coalesce(name, 'Unknown') from {{ source('dbo', 'users') }}",
  "changes": ["ISNULL → COALESCE", "Bracket notation → dbt source()"],
  "warnings": [],
  "tokensUsed": 245,
  "durationMs": 1423
}
```

### `POST /api/auth/signup`
Register a new user.

**Request:** `{ "email", "password", "name?", "company?" }`
**Response:** `{ "success": true, "user": {...} }`

### `POST /api/auth/signin`
Sign in and log the event.

**Request:** `{ "email", "password" }`
**Response:** `{ "success": true, "user": {...} }`

### `POST /api/auth/signout` | `GET /api/auth/signout`
Sign out and redirect to home.

### `POST /api/waitlist`
Join the waitlist.

**Request:** `{ "email", "name?", "company?", "tier?" }`
**Response:** `{ "success": true, "id": "..." }`

### `GET /api/admin/stats`
Fetch admin dashboard data (requires `ADMIN_EMAILS` auth).

### `POST /api/stripe/checkout`
Create a Stripe checkout session.

### `POST /api/stripe/webhook`
Handle Stripe subscription events.

---

## Database Schema

```sql
-- Waitlist entries
waitlist_entries (
  id          TEXT PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  name        TEXT,
  company     TEXT,
  tier        TEXT DEFAULT 'design_partner',
  created_at  TIMESTAMPTZ DEFAULT NOW()
)

-- User profiles (linked to auth.users)
profiles (
  id          TEXT PRIMARY KEY → auth.users(id),
  email       TEXT UNIQUE NOT NULL,
  name        TEXT,
  company     TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
)

-- Login audit log
login_logs (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  email       TEXT,
  ip          TEXT,
  country     TEXT,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
)

-- Subscriptions
subscriptions (
  id                      TEXT PRIMARY KEY,
  user_id                 TEXT UNIQUE NOT NULL,
  stripe_customer_id      TEXT UNIQUE,
  stripe_subscription_id  TEXT UNIQUE,
  plan                    TEXT DEFAULT 'free',
  status                  TEXT DEFAULT 'inactive',
  current_period_end      TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
)
```

---

## Authentication Flow

```
User clicks Sign Up → POST /api/auth/signup
  → Supabase creates auth.users entry
  → Prisma creates profiles entry
  → Returns user object

User clicks Sign In → POST /api/auth/signin
  → Supabase validates credentials
  → Prisma logs login (IP, country, UA)
  → Returns user + sets session cookies

Every page load → Middleware (proxy.ts)
  → Refreshes Supabase session cookies
  → Redirects /dashboard/* to /login if unauthenticated
```

---

## AI Migration Engine

### How It Works

1. User pastes SQL and selects source/target dialects
2. Frontend sends `POST /api/migrate`
3. Backend builds a specialized system prompt for the dialect pair
4. OpenAI GPT-4o-mini translates the SQL
5. Response is parsed into: translated SQL, changes list, warnings list
6. Frontend displays result with stats and transformation details

### System Prompt Strategy

The AI is instructed to:
- Translate ALL dialect-specific syntax (functions, types, keywords)
- Convert naming conventions (PascalCase → snake_case)
- Use dbt Jinja syntax for Snowflake targets
- Preserve business logic exactly
- Report all transformations and potential warnings

### Cost Estimate

- **GPT-4o-mini**: ~$0.15/1M input tokens, ~$0.60/1M output tokens
- **Average translation**: ~500 tokens → **~$0.0003 per translation**
- **1,000 translations/day** → ~$0.30/day

---

## Deployment

- **Platform**: Vercel
- **Repository**: [github.com/codeman403/morphdb](https://github.com/codeman403/morphdb) (private)
- **Branch**: `main` (auto-deploy on push)
- **Database**: Supabase PostgreSQL (connection pooler on port 6543)
- **Build**: `next build` with `postinstall: prisma generate`

### Deployment Steps

1. Push to `main` → Vercel auto-deploys
2. Set all environment variables in Vercel Dashboard (see table above)
3. `postinstall` auto-runs `prisma generate` during build
4. Update `NEXT_PUBLIC_SITE_URL` to your live domain after first deploy

### Stripe Setup (Before Monetization Goes Live)

1. Create a Stripe account → Create Product: "MorphDB Design Partner" ($499/mo)
2. Copy **Price ID** → set as `STRIPE_DESIGN_PARTNER_PRICE_ID`
3. Add Webhook endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
4. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
5. Copy **Webhook Signing Secret** → set as `STRIPE_WEBHOOK_SECRET`

### Post-Deploy Smoke Tests

- [ ] Landing page loads correctly
- [ ] Sign Up creates user + profile
- [ ] Sign In works, login logs appear
- [ ] Sign Out redirects to homepage
- [ ] Waitlist form submits
- [ ] `/dashboard` redirects to `/login` if unauthenticated
- [ ] AI Demo translates SQL correctly
- [ ] Admin panel shows stats (after adding `ADMIN_EMAILS`)

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |
| `DATABASE_URL` | ✅ | Supabase Pooler URL (port 6543) |
| `DIRECT_URL` | ⚡ | Direct connection (port 5432, migrations only) |
| `OPENAI_API_KEY` | ✅ | OpenAI API key for AI translations |
| `ADMIN_EMAILS` | ✅ | Comma-separated admin emails |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Production URL (e.g., https://morphdb.vercel.app) |
| `STRIPE_SECRET_KEY` | 💳 | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | 💳 | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | 💳 | Stripe webhook signing secret |
| `STRIPE_DESIGN_PARTNER_PRICE_ID` | 💳 | Stripe price ID for Design Partner tier |

---

## Upcoming Updates

### 🔜 Next Up
- [ ] Stripe production setup (real products/prices)
- [ ] UI polish: loading skeletons, toast notifications, mobile responsiveness
- [ ] Migration history: save past translations per user
- [ ] Bulk migration: upload .sql files for batch processing

### 🗺️ Roadmap
- [ ] Multi-file schema migration (entire database at once)
- [ ] Side-by-side diff view for source vs translated SQL
- [ ] Export to dbt project structure (models/, sources.yml)
- [ ] Team workspaces with shared migration history
- [ ] Self-hosted option with custom LLM backends
- [ ] Support for stored procedures, triggers, and views
- [ ] Migration validation (syntax checking + test execution)

---

## Changelog

### v1.0.0 — Developer Beta (2026-02-24)
- 🤖 Real AI migration engine (GPT-4o-mini)
- 📊 Admin dashboard with waitlist, login logs, user stats
- 🛡️ Rate limiting on all mutation endpoints
- 🔐 Full auth flow (sign up, sign in, sign out, session persistence)
- 💳 Stripe checkout + webhook integration
- 🏠 Landing page with animations (Hero, Features, How It Works, Pricing, Footer)
- 📝 Waitlist capture with duplicate detection
- 🚀 Deployed on Vercel with Supabase Pooler connection

### v0.1.0 — Landing Page (2026-02-23)
- Initial Next.js 16 scaffold
- Landing page with all sections
- Basic auth setup
- Supabase + Prisma 7 integration
