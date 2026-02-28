#!/usr/bin/env node

/**
 * Database Migration Runner
 * Applies pending Prisma migrations to your Supabase database
 * 
 * Usage: node scripts/apply-migrations.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.dirname(path.dirname(__filename));
process.chdir(projectRoot);

// Load .env.local
const envLocalPath = path.join(projectRoot, '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=');
      process.env[key.trim()] = value.trim();
    }
  });
  console.log('✓ Loaded environment from .env.local\n');
} else {
  console.log('⚠️  No .env.local file found\n');
}

// Verify DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL is not set');
  console.error('   Make sure your .env.local contains DATABASE_URL\n');
  process.exit(1);
}

console.log('🔄 Applying database migrations...\n');
console.log('✓ DATABASE_URL is configured\n');

try {
  console.log('⏳ Running: npx prisma db push --accept-data-loss');
  console.log('   (This may take a minute or two...)\n');
  
  execSync('npx prisma db push --accept-data-loss', {
    stdio: 'inherit',
    env: process.env,
    timeout: 300000 // 5 minute timeout
  });

  console.log('\n✅ Migrations applied successfully!\n');
  console.log('📊 The following tables should now exist in your database:');
  console.log('   - profiles');
  console.log('   - subscriptions');
  console.log('   - migration_batches');
  console.log('   - migration_results');
  console.log('   - monthly_usage');
  console.log('   - support_tickets');
  console.log('   - login_logs');
  console.log('   - waitlist_entries');
  console.log('   - webhook_events');
  console.log('   - idempotency_keys');
  console.log('   - audit_logs\n');
  console.log('🎉 Your dashboard will now display batch migration history!\n');
  
} catch (error) {
  console.error('\n❌ Migration failed!\n');
  console.error('Error:', error.message);
  console.error('\nTroubleshooting tips:');
  console.error('1. Check that DATABASE_URL in .env.local is correct');
  console.error('2. Verify your Supabase project is running');
  console.error('3. Check your network connection to Supabase');
  console.error('4. Try running manually: npx prisma db push --accept-data-loss\n');
  process.exit(1);
}
