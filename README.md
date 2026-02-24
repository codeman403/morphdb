# MorphDB 🦋

> **The AI Co-Pilot for Database Migrations**  
> *Built for the AI Vibe Coding Hackathon 2026*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)](https://vercel.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?logo=supabase)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/AI-OpenAI%20%7C%20Anthropic-412991)](https://openai.com/)

MorphDB is an advanced, AI-powered semantic translation engine that automatically converts legacy relational database schemas (SQL Server, Oracle, MySQL) into modern cloud-native SQL (Snowflake/dbt, BigQuery, PostgreSQL). 

It eliminates the manual, error-prone bottlenecks of enterprise digital transformation by precisely preserving business logic across varying SQL dialects.

---

## 🚀 Live Production URL
**Deployed on Vercel**: [https://morphdb.vercel.app/](https://morphdb.vercel.app/)

---

## ✨ Key Features

- 🤖 **Multi-LLM Translation Engine**: Intelligently routes translation requests to **OpenAI GPT-4o-mini** (for speed) or **Anthropic Claude 3.5 Sonnet** (for complex logic preservation).
- 📦 **Batch Processing**: Upload entire schema dumps (.sql, .txt). The custom parser tokenizes and translates hundreds of tables, views, and procedures concurrently.
- 🚦 **Tiered Access Control**: Full SaaS monetization setup with Free, Pro (3-day free trial available), Design Partner, and Enterprise tiers enforcing usage limits and model selection.
- 📊 **Migration History**: Complete tracking of past migrations, displaying success/failure rates, tokens used, and translation times.
- 💳 **Stripe Monetization**: Built-in Stripe checkout and webhook handling for automatic tier upgrades.
- 🔐 **Secure Authentication**: Supabase Auth (SSR) with robust Next.js middleware session management and rate limiting.
- 🎫 **Support System**: Built-in support ticket system for user inquiries.
- ⚙️ **Admin Dashboard**: Comprehensive admin panel with user management, usage resets, and support ticket handling.

---

## 🏗️ Technical Architecture

This application is engineered specifically for Vercel's serverless edge environment:
- **Framework**: Next.js 16.1.6 App Router
- **UI**: React 19, Tailwind CSS v4, Framer Motion
- **Database**: Supabase PostgreSQL + Prisma 7 ORM (utilizing Transaction Pooler on port 6543)
- **Deployment**: Vercel auto-deploy pipeline

👉 **For a deep dive into the architecture, database schema diagrams, and data flow, read the comprehensive [Architecture Documentation (ARCHITECTURE.md)](./ARCHITECTURE.md).**

---

## 🛠️ Vercel Deployment Guide

This repository is configured to deploy directly to Vercel. Local setup is not required.

1. **Connect Repository**: In the Vercel Dashboard, import this GitHub repository.
2. **Configure Environment Variables**: Add the following keys in Vercel settings:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   DATABASE_URL=postgresql://postgres...aws-1-us-east-1.pooler.supabase.com:6543/postgres
   OPENAI_API_KEY=...
   ANTHROPIC_API_KEY=...
   STRIPE_SECRET_KEY=...
   STRIPE_WEBHOOK_SECRET=...
   STRIPE_PRO_PRICE_ID=...
   NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
   ADMIN_EMAILS=you@example.com
   ```
3. **Database Schema Setup**: 
   Because `prisma db push` hangs on Vercel's serverless builds with connection poolers, execute the raw SQL found in `ARCHITECTURE.md` directly within the Supabase SQL Editor to construct the `migration_batches`, `migration_results`, `monthly_usage`, and `support_tickets` tables.
4. **Deploy**: Vercel handles the Next.js build and Prisma client generation automatically.

---

## 📝 License
Private Repository — Created for the AI Vibe Coding Hackathon.