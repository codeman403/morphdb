-- CreateTable profiles
CREATE TABLE IF NOT EXISTS "profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "company" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateTable waitlist_entries
CREATE TABLE IF NOT EXISTS "waitlist_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "company" TEXT,
    "tier" TEXT NOT NULL DEFAULT 'design_partner',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable login_logs
CREATE TABLE IF NOT EXISTS "login_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "email" TEXT,
    "ip" TEXT,
    "country" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex login_logs_user_id_created_at_idx
CREATE INDEX IF NOT EXISTS "login_logs_user_id_created_at_idx" ON "login_logs"("user_id", "created_at");

-- CreateTable subscriptions
CREATE TABLE IF NOT EXISTS "subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL UNIQUE,
    "stripe_customer_id" TEXT UNIQUE,
    "stripe_subscription_id" TEXT UNIQUE,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "status" TEXT NOT NULL DEFAULT 'inactive',
    "trial_taken_at" TIMESTAMP(3),
    "trial_ends_at" TIMESTAMP(3),
    "current_period_end" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateIndex subscriptions_stripe_subscription_id_idx
CREATE INDEX IF NOT EXISTS "subscriptions_stripe_subscription_id_idx" ON "subscriptions"("stripe_subscription_id");

-- CreateTable migration_batches (or alter if exists)
CREATE TABLE IF NOT EXISTS "migration_batches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "source_dialect" TEXT NOT NULL,
    "target_dialect" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "total_statements" INTEGER NOT NULL,
    "success_count" INTEGER NOT NULL,
    "failed_count" INTEGER NOT NULL,
    "total_tokens" INTEGER NOT NULL,
    "total_duration_ms" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,
    "cancellation_token_id" TEXT
);

-- Add missing columns if they don't exist
ALTER TABLE "migration_batches" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
ALTER TABLE "migration_batches" ADD COLUMN IF NOT EXISTS "deleted_by" TEXT;
ALTER TABLE "migration_batches" ADD COLUMN IF NOT EXISTS "cancellation_token_id" TEXT;

-- CreateIndex migration_batches_user_id_idx
CREATE INDEX IF NOT EXISTS "migration_batches_user_id_idx" ON "migration_batches"("user_id");

-- CreateIndex migration_batches_created_at_idx
CREATE INDEX IF NOT EXISTS "migration_batches_created_at_idx" ON "migration_batches"("created_at");

-- CreateIndex migration_batches_user_id_deleted_at_idx
CREATE INDEX IF NOT EXISTS "migration_batches_user_id_deleted_at_idx" ON "migration_batches"("user_id", "deleted_at") WHERE "deleted_at" IS NULL;

-- CreateTable migration_results
CREATE TABLE IF NOT EXISTS "migration_results" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "batch_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "statement_name" TEXT NOT NULL,
    "statement_type" TEXT NOT NULL,
    "original_sql" TEXT NOT NULL,
    "translated_sql" TEXT,
    "changes" TEXT[],
    "warnings" TEXT[],
    "tokens_used" INTEGER NOT NULL,
    "duration_ms" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "migration_results_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "migration_batches" ("id") ON DELETE CASCADE
);

-- CreateIndex migration_results_batch_id_idx
CREATE INDEX IF NOT EXISTS "migration_results_batch_id_idx" ON "migration_results"("batch_id");

-- CreateTable monthly_usage
CREATE TABLE IF NOT EXISTS "monthly_usage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "year_month" TEXT NOT NULL,
    "batch_count" INTEGER NOT NULL DEFAULT 0,
    "translation_count" INTEGER NOT NULL DEFAULT 0,
    "token_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "monthly_usage_user_id_year_month_key" UNIQUE("user_id", "year_month")
);

-- CreateIndex monthly_usage_user_id_idx
CREATE INDEX IF NOT EXISTS "monthly_usage_user_id_idx" ON "monthly_usage"("user_id");

-- CreateTable support_tickets
CREATE TABLE IF NOT EXISTS "support_tickets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateIndex support_tickets_user_id_idx
CREATE INDEX IF NOT EXISTS "support_tickets_user_id_idx" ON "support_tickets"("user_id");

-- CreateIndex support_tickets_status_idx
CREATE INDEX IF NOT EXISTS "support_tickets_status_idx" ON "support_tickets"("status");

-- CreateTable webhook_events
CREATE TABLE IF NOT EXISTS "webhook_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_id" TEXT NOT NULL UNIQUE,
    "event_type" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex webhook_events_event_id_idx
CREATE INDEX IF NOT EXISTS "webhook_events_event_id_idx" ON "webhook_events"("event_id");

-- CreateIndex webhook_events_processed_idx
CREATE INDEX IF NOT EXISTS "webhook_events_processed_idx" ON "webhook_events"("processed");

-- CreateTable idempotency_keys
CREATE TABLE IF NOT EXISTS "idempotency_keys" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL UNIQUE,
    "user_id" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL
);

-- CreateIndex idempotency_keys_user_id_created_at_idx
CREATE INDEX IF NOT EXISTS "idempotency_keys_user_id_created_at_idx" ON "idempotency_keys"("user_id", "created_at");

-- CreateTable audit_logs
CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "changes" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL
);

-- CreateIndex audit_logs_user_id_created_at_idx
CREATE INDEX IF NOT EXISTS "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at");

-- CreateIndex audit_logs_resource_type_resource_id_idx
CREATE INDEX IF NOT EXISTS "audit_logs_resource_type_resource_id_idx" ON "audit_logs"("resource_type", "resource_id");

-- CreateIndex audit_logs_expires_at_idx
CREATE INDEX IF NOT EXISTS "audit_logs_expires_at_idx" ON "audit_logs"("expires_at");
