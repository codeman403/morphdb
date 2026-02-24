# Agent Instructions: MorphDB

Welcome to the MorphDB hackathon repository - an AI-powered database migration SaaS platform.

## Project Overview
MorphDB is a B2B SaaS platform that acts as an "AI Co-Pilot for Database Migrations." It helps Data Engineers translate legacy SQL dialects (SQL Server, Oracle, MySQL, PostgreSQL) into modern data warehouse formats (Snowflake/dbt, BigQuery, PostgreSQL, Redshift).

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Database:** Prisma ORM + PostgreSQL (Supabase)
- **Auth:** Supabase Auth (SSR)
- **Payments:** Stripe
- **AI:** OpenAI GPT-4o-mini, Anthropic Claude

## Project Structure
```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── demo/page.tsx               # Demo page with live translation
│   ├── login/page.tsx              # Authentication
│   ├── waitlist/page.tsx           # Early access signup
│   ├── support/page.tsx            # Support ticket form
│   ├── dashboard/
│   │   ├── page.tsx                # User dashboard
│   │   ├── migrate/page.tsx        # Batch migration tool
│   │   ├── history/page.tsx       # Migration history
│   │   └── admin/page.tsx          # Admin panel
│   └── api/
│       ├── migrate/                # Translation endpoints
│       ├── stripe/                 # Payment webhooks
│       ├── auth/                   # Auth handlers
│       ├── admin/                  # Admin endpoints
│       ├── support/               # Support tickets
│       └── trial/                  # Free trial management
├── components/
│   ├── layout/                     # Navbar, Footer
│   └── sections/                   # Hero, Features, Pricing, HowItWorks
├── lib/
│   ├── tier.ts                     # Tier management & limits
│   ├── usage.ts                    # Usage tracking
│   ├── prisma.ts                   # Database client
│   └── supabase/                  # Auth clients
└── generated/prisma/               # Prisma client
```

## Database Models (Prisma Schema)
- **Profile** - User metadata
- **Subscription** - Plan status, trial tracking
- **MigrationBatch** - Translation batch records
- **MigrationResult** - Individual statement translations
- **MonthlyUsage** - Usage tracking per month
- **LoginLog** - Auth audit trail
- **WaitlistEntry** - Pre-launch leads
- **SupportTicket** - Support inquiries

## Key Features Implemented
1. **Tier System:** Free, Pro ($15/mo), Design Partner ($50/mo), Enterprise
2. **3-Day Free Trial:** One-time trial per user
3. **Batch Translation:** File upload + paste SQL
4. **Admin Panel:** User management, usage reset, support tickets, grant access
5. **Support System:** Ticket submission with status tracking
6. **Stripe Integration:** Subscription payments

## Guidelines for AI Agents
1. **Never expose API keys** - Use environment variables for all secrets
2. **Follow existing code patterns** - Match the styling, component structure, and conventions
3. **Use proper imports** - Always use path aliases (`@/lib/...`)
4. **Run lint before commit** - Execute `npm run lint` to check for errors
5. **Commit conventions** - Use `feat:`, `fix:`, `docs:`, `chore:`
6. **Test changes** - Verify functionality before pushing
7. **Check working directory** - Always verify path before editing

## Common Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npx prisma generate  # Generate Prisma client
```

## Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_PRICE_ID`
- `STRIPE_DESIGN_PARTNER_PRICE_ID`
- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_EMAILS`
