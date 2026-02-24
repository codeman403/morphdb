# MorphDB — Architecture & Product Documentation

> **Last Updated**: 2026-02-24
> **Version**: 1.1.0 (Developer Beta)
> **Maintainer**: codeman403

---

## TL;DR

MorphDB is an AI-powered database migration co-pilot that translates SQL between dialects (SQL Server, Oracle, MySQL, PostgreSQL → Snowflake/dbt, PostgreSQL, BigQuery, Redshift). Built as a SaaS with Next.js 16, Supabase Auth, Prisma 7, Stripe, and OpenAI GPT-4o-mini / Claude 3.5 Sonnet.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Features Implemented](#features-implemented)
4. [Upcoming Features](#upcoming-features)
5. [Database Schema](#database-schema)
6. [Security & Authentication](#security--authentication)
7. [Deployment](#deployment)

---

## Architecture Overview

MorphDB utilizes a modern, serverless architecture centered around Next.js App Router, deployed on Vercel. 

- **Frontend**: React 19, Tailwind CSS v4, Framer Motion for animations.
- **Backend**: Next.js API Routes handle AI translation, rate limiting, and Stripe webhooks.
- **Database**: Supabase PostgreSQL accessed via Prisma ORM. Uses connection pooling (port 6543) for application queries and direct connection for migrations.
- **Authentication**: Supabase Auth with server-side rendering (SSR) and middleware session management.
- **AI Translation**: Intelligent routing between OpenAI (GPT-4o-mini for Free tier) and Anthropic (Claude 3.5 Sonnet for Pro tier).

---

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **UI**: React 19.2.3, Tailwind CSS 4.x
- **Animations**: Framer Motion 12.x
- **Icons**: Lucide React
- **ORM**: Prisma 7.4.1 (with pg adapter)
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase SSR
- **Payments**: Stripe 20.x
- **AI**: OpenAI SDK, Anthropic SDK
- **Toast Notifications**: Sonner
- **Hosting**: Vercel

---

## Features Implemented

### 1. Tier-Based Pricing & Access Control
A robust 4-tier pricing system (Free, Pro, Design Partner, Enterprise).
- **Free Tier**: 5 batches/month, 10 files/batch, 50 translations/month. Limited to GPT-4o-mini.
- **Pro Tier**: 50 batches/month, 50 files/batch, 500 translations/month. Unlocks Claude models.
- **Enforcement**: Middleware and API routes strictly enforce quotas and model access based on the user's active Stripe subscription.

### 2. Batch Migration Engine
- **File Upload**: Drag & drop support for `.sql` and `.txt` files (max 500KB per file).
- **Multi-Statement Parsing**: Custom SQL parser splits large files into individual logical statements (tables, views, procedures).
- **AI Translation**: Translates source dialects to target dialects while preserving business logic and generating dbt syntax where applicable.
- **Progress Tracking**: Real-time visual progress bar during batch processing.

### 3. Migration History & Usage Tracking
- **Persistence**: Every batch migration and its individual statement results are stored in the database.
- **History Dashboard**: Users can view past migrations, success/failure rates, and token usage at `/dashboard/history`.
- **Usage Quotas**: Live tracking of monthly translation counts, batch counts, and token usage displayed on the user dashboard.

### 4. Interactive Results & Export
- **Diff View**: Side-by-side comparison of original vs. translated SQL.
- **Categorization**: Color-coded badges for statement types (CREATE_TABLE, PROCEDURE, etc.).
- **Export**: Download individual translations or full batches as ZIP archives (via `jszip`).
- **Feedback**: Global toast notifications for success, errors, and clipboard actions.

### 5. Authentication & User Management
- Secure email/password login and registration via Supabase.
- Session persistence via Next.js middleware.
- Admin dashboard (`/dashboard/admin`) for viewing system-wide stats (waitlist, active users, login logs).

### 6. Stripe Monetization
- Integrated checkout flow for upgrading to Pro/Design Partner tiers.
- Robust webhook handler (`/api/stripe/webhook`) processing `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted` events to manage access tiers automatically.

---

## Upcoming Features

The following features are slated for future iterations:

1. **dbt Project Generation (P3)**: Automatically scaffold a complete dbt project directory structure, including `models/`, `sources.yml`, and `schema.yml` test definitions directly from the translated SQL.
2. **Advanced Diff Viewer (P3)**: Implement a granular, line-by-line highlighted diff viewer (similar to GitHub pull requests) for easier review of SQL changes.
3. **Multi-file Schema Context**: Allow the AI to understand relationships between multiple uploaded files simultaneously (e.g., resolving foreign keys across separate table definition files).
4. **Team Workspaces**: Shared migration history and centralized billing for organizational teams.
5. **Migration Validation Engine**: Built-in syntax checking against target data warehouse dialects before export.

---

## Database Schema

The core schema includes:
- `Profile`: User metadata linked to Supabase Auth.
- `Subscription`: Tracks Stripe customer and active plan details.
- `MigrationBatch`: High-level summary of a migration run (source, target, total tokens).
- `MigrationResult`: Individual SQL statement translations linked to a batch.
- `MonthlyUsage`: Tracks rolling monthly quotas for rate limiting.
- `LoginLog`: Security audit trail.
- `WaitlistEntry`: Pre-launch lead capture.

---

## Security & Authentication

- **Rate Limiting**: Sliding window rate limits on auth and AI endpoints (e.g., 5 batch requests/minute).
- **Environment Management**: Strict separation of database credentials. `DATABASE_URL` uses port 6543 (transaction pooler) for secure scalable app queries.
- **Data Protection**: Prepared statements via Prisma prevent SQL injection.
- **Admin Access**: Gated via explicit email allowlists in environment variables.

---

## Deployment

Deployed exclusively via Vercel connecting to a Supabase backend.

**Key Environment Variables required for production:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL` (Supabase Pooler)
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_PRICE_ID`
- `NEXT_PUBLIC_SITE_URL`

*(Schema migrations are handled manually via Supabase SQL Editor to bypass pooler limitations during Vercel builds.)*