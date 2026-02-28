#!/bin/bash
# This script applies pending database migrations to your Supabase database
# Run this after ensuring your DATABASE_URL environment variable is properly set

set -e

echo "🔄 Applying database migrations..."
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL environment variable is not set"
  echo "   Make sure your .env.local file contains the DATABASE_URL"
  exit 1
fi

# Run prisma db push
npx prisma db push --accept-data-loss

echo ""
echo "✅ Migrations applied successfully!"
echo ""
echo "📊 The following tables should now exist in your database:"
echo "   - profiles"
echo "   - subscriptions"
echo "   - migration_batches"
echo "   - migration_results"
echo "   - monthly_usage"
echo "   - support_tickets"
echo "   - login_logs"
echo "   - waitlist_entries"
echo ""
echo "🎉 Your dashboard will now display batch migration history!"
