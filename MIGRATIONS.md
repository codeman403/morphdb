# Database Migrations

This document explains the database migration setup and how to apply pending migrations.

## Current Status

The application has database schemas defined in `prisma/schema.prisma` with migration SQL files in `prisma/migrations/init/`. However, **these migrations need to be applied to your Supabase database** for full functionality.

## What Happens Without Migrations

Without applying migrations, the dashboard will still load successfully, but:
- ❌ Batch migration history will not display (empty "Recent Migrations" section)
- ❌ Profile information may not be fully stored
- ❌ Usage tracking will be limited

The application gracefully handles the missing tables and shows helpful empty states.

## How to Apply Migrations

### Option 1: Using the Helper Script (Recommended)

```bash
./scripts/apply-migrations.sh
```

This script:
1. Checks that your `DATABASE_URL` is properly configured
2. Runs `npx prisma db push` to apply all pending migrations
3. Confirms the tables have been created

### Option 2: Manual Command

If the script doesn't work, you can run manually:

```bash
npx prisma db push --accept-data-loss
```

### Option 3: Supabase Dashboard

1. Go to your [Supabase Dashboard](https://supabase.com)
2. Navigate to SQL Editor
3. Copy and paste the contents of `prisma/migrations/init/migration.sql`
4. Execute the SQL

## Tables Created

Once migrations are applied, the following tables will exist in your database:

- `profiles` - User profile information
- `subscriptions` - Subscription/billing status
- `migration_batches` - Records of SQL migration batches
- `migration_results` - Individual statement translation results
- `monthly_usage` - Usage tracking per month
- `support_tickets` - Support ticket submissions
- `login_logs` - Authentication audit trail
- `waitlist_entries` - Early access signups
- `webhook_events` - Stripe webhook tracking
- `idempotency_keys` - Duplicate request prevention
- `audit_logs` - Admin action audit trail

## After Migrations Are Applied

Once migrations are applied:
1. ✅ Dashboard will display batch migration history
2. ✅ User profiles will be saved and displayed
3. ✅ Usage tracking will work fully
4. ✅ Support tickets will be stored
5. ✅ All features will be fully functional

No code changes are needed - the application will automatically start using the tables once they exist!

## Troubleshooting

### Connection Timeout
If you get timeout errors when applying migrations, check:
1. Your `DATABASE_URL` is correct
2. Your Supabase project is running
3. Network connectivity to Supabase is working
4. Your firewall allows connections to Supabase

### Already Applied
If you run the migrations multiple times, that's fine - the `CREATE TABLE IF NOT EXISTS` statements are idempotent and won't cause errors.

### Questions?
See the [Prisma Migrate documentation](https://www.prisma.io/docs/orm/prisma-migrate/getting-started) for more help.
