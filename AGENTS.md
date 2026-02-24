# MorphDB — Agent Instructions & Feature Roadmap

> Last updated: 2026-02-24

## Project Overview
MorphDB is an AI-powered SaaS for database migration — translating legacy SQL dialects (SQL Server, Oracle, MySQL) into modern targets (Snowflake/dbt, PostgreSQL, BigQuery, Redshift). Built with Next.js 16, Tailwind 4, Prisma 7, Supabase, OpenAI, and Anthropic.

## Key Conventions
- **Auth**: Supabase Auth (email/password) with server-side middleware
- **Database**: Supabase Postgres via Transaction Pooler (port 6543)
- **AI**: Multi-LLM (GPT-4o Mini, Claude Haiku, Claude Sonnet)
- **Profile names**: Always display **first name only** across all pages
- **Two modes**: Demo (public, GPT-4o Mini, 2K chars) and Developer Beta (auth, all models, 10K chars, batch)
- **Session timeout**: 30min inactivity with 2min warning notification
- **Remove this file** once all features below are implemented

## Feature Roadmap

| # | Priority | Feature | Description | Status |
|---|----------|---------|-------------|--------|
| 1 | **P0** | Migration History | Persist translations to DB — users can view past migrations, re-download, track usage | ⬜ Todo |
| 2 | **P0** | Stripe Production Setup | Create real products/prices, set webhook secrets, enable paid tiers | ⬜ Todo |
| 3 | **P1** | Usage Quotas | Track token usage per user, enforce tier-based limits (free vs Design Partner) | ⬜ Todo |
| 4 | **P1** | Toast Notifications | Global toast system for success/error feedback (copy, translate, auth events) | ⬜ Todo |
| 5 | **P2** | Mobile Responsiveness | Polish mobile layouts for demo, dashboard, and migrate pages | ⬜ Todo |
| 6 | **P2** | Loading Skeletons | Replace blank states with skeleton loaders for better perceived performance | ⬜ Todo |
| 7 | **P3** | dbt Project Generation | Generate full dbt project structure (models, tests, schema.yml) from translated SQL | ⬜ Todo |
| 8 | **P3** | Diff Viewer | Side-by-side diff highlighting showing exactly what changed between source and translated SQL | ⬜ Todo |

### Status Legend
- ⬜ Todo
- 🔄 In Progress
- ✅ Done
