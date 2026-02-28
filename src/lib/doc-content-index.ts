/**
 * Extract all text content from documentation pages for full-text search
 * Maps document slugs to searchable text content
 */

export const docContentIndex: Record<string, string> = {
  'get-started': 'Getting Started Learn the basics of MorphDB and get up and running in minutes.',
  'get-started/introduction': `Introduction to MorphDB
    MorphDB is an AI-powered database migration platform designed for data engineers. It helps you translate legacy SQL dialects into modern data warehouse formats safely and efficiently.
    What You Can Do
    Translate SQL from SQL Server, Oracle, MySQL, and PostgreSQL
    Convert to Snowflake, BigQuery, PostgreSQL, or Redshift
    Maintain complete audit trails of all migrations
    Cancel in-progress migrations without data loss
    Leverage AI to handle complex translations
    Getting Started
    Ready to start? Head over to the Quick Start guide to set up your first migration in minutes.`,
  
  'get-started/quick-start': `Quick Start Guide
    Get up and running with MorphDB in just a few minutes.
    Sign Up
    Create your free MorphDB account. You get 3 days of free trial with full feature access.
    Prepare Your SQL
    Have your legacy SQL queries or database schema ready. You can paste SQL code or upload files.
    Configure Translation
    Select your source database type and target platform. The AI will handle the rest.
    Review & Export
    Review the translated SQL, make adjustments if needed, and export the results.
    Pro Tip
    Start with a small SQL query to understand how MorphDB works. Then migrate your complete database schema.`,
  
  'get-started/authentication': `Authentication
    MorphDB uses secure authentication to protect your data and migrations.
    Sign Up & Login
    Create your account on the login page. We support email/password authentication via Supabase.
    Free Trial
    New users get a 3-day free trial with full access to all features. No credit card required for the trial.
    Sessions
    Your session is managed securely and automatically. You'll be logged out after 15 minutes of inactivity for security.`,
  
  'features': 'Features Explore the powerful features that make MorphDB the best choice for database migrations.',
  
  'features/soft-delete': `Soft Delete & Audit Trail
    Safely delete migration batches with complete audit history for compliance and troubleshooting.
    What is Soft Delete?
    When you delete a migration batch, it's marked as deleted but the data is never actually removed from our systems. This ensures complete compliance and gives you an immutable audit trail of all actions.
    How It Works
    Batch is marked as deleted but remains in the database
    Users can't access deleted batches in their history
    Admins can view the complete audit trail
    Audit logs are kept for 90 days
    Benefits
    Complete audit trail for regulatory requirements
    Troubleshoot issues by reviewing deleted operations
    Data safety - nothing is truly deleted`,
  
  'features/batch-cancellation': `Batch Cancellation
    Cancel long-running migrations at any time without losing your progress.
    How It Works
    When you cancel a batch:
    The currently processing statement is completed
    All remaining statements are marked as cancelled
    You can view partial results immediately
    Key Features
    Cancellation is safe and idempotent
    No data loss when cancelling
    You can cancel multiple times without issues
    View which statements were processed vs cancelled`,
  
  'features/enhanced-logging': `Enhanced Logging & Privacy
    All actions are logged with automatic privacy protection built in.
    What We Log
    Batch creation and updates
    Migration progress and completion
    Cancellations and deletions
    All admin actions
    System errors and troubleshooting information
    Privacy by Default
    All sensitive information is automatically protected:
    Email addresses are hashed with SHA-256
    IP addresses are masked to CIDR blocks
    Device fingerprints are removed
    Connection strings and API keys are never logged
    Structured Logging
    Our logs are machine-readable JSON, making them easy to search and analyze. Each log entry includes a timestamp and request ID for tracing.`,
  
  'features/security': `Security
    MorphDB is built with security and compliance as core principles.
    Security Features
    HTTPS encryption for all data in transit
    At-rest encryption for databases
    Role-based access control RBAC
    Audit logging for all operations
    Regular security audits and penetration testing`,
  
  'troubleshooting': 'Troubleshooting Find solutions to common issues and learn best practices.',
  
  'troubleshooting/common-issues': `Common Issues
    Solutions to frequently encountered problems.
    Migration is taking too long
    If your migration is running slower than expected:
    Try cancelling and running smaller batches
    Check your network connectivity
    Ensure your SQL queries are optimized
    Contact support if the issue persists
    Translation errors
    If MorphDB can't translate some SQL statements:
    Some proprietary SQL features may not be automatically translatable
    You can manually review and adjust the translated output
    Submit a support ticket with examples for us to improve
    Free trial expired
    If your 3-day trial ended:
    Upgrade to a paid plan or it will be downgraded to Free plan
    Contact us about special pricing for your use case`,
  
  'troubleshooting/faq': `Frequently Asked Questions
    Can I recover a deleted batch?
    No, soft-deleted batches cannot be recovered by users. However, MorphDB admins can access the audit log to review what was deleted and when.
    Will cancelling a batch lose my progress?
    No. When you cancel a batch, all the statements that were already processed remain in your history. Only the remaining statements are marked as cancelled.
    How long are audit logs kept?
    Audit logs are kept for 90 days. After that, they are automatically deleted. This complies with common data retention policies while maintaining reasonable audit history.
    Can I see the audit logs?
    Only MorphDB administrators can view audit logs. This ensures sensitive operational data remains protected while maintaining full compliance.
    Is my personal data safe in the logs?
    Yes. All sensitive information is automatically protected: emails are hashed, IPs are masked, and device fingerprints are removed. Your personal data is never exposed, even in error messages.`,
  
  'troubleshooting/error-codes': `Error Codes
    Common error codes and their meanings.
    400 Bad Request - Check your request parameters
    403 Forbidden - You don't have permission for this action
    429 Rate Limited - Wait before making more requests
    500 Server Error - Contact support`,
  
  'troubleshooting/performance': `Performance Optimization
    Tips for optimizing your migration performance.
    Batch Size
    Process smaller batches for faster results. Breaking large migrations into 50-100 statement chunks often improves performance.
    Network Connectivity
    Ensure you have a stable internet connection. Poor connectivity can significantly slow down the migration process.
    SQL Optimization
    Pre-optimize your SQL queries before migration. Remove unnecessary complexity and ensure queries follow best practices.
    Parallel Migrations
    Run multiple migrations in parallel. The system can handle several concurrent translation batches.`,
  
  'changelog': `Changelog
    Version 2.1.0 - 2026-02-27
    Implemented soft delete with 90-day audit retention
    Added batch cancellation with partial results
    Enhanced logging with PII masking
    Added comprehensive documentation site
    Version 2.0.0 - 2026-02-01
    Upgraded to Next.js 16 with App Router
    Migrated to Tailwind CSS v4
    Redesigned admin panel
    Version 1.5.0 - 2025-12-15
    Added support for Redshift as target platform
    Improved translation accuracy for complex queries`,
};

/**
 * Search across all documentation
 * Returns array of slugs that match the query
 */
export function searchDocumentation(query: string): string[] {
  if (!query.trim()) return [];
  
  const lowerQuery = query.toLowerCase();
  const matches: string[] = [];
  
  for (const [slug, content] of Object.entries(docContentIndex)) {
    if (content.toLowerCase().includes(lowerQuery)) {
      matches.push(slug);
    }
  }
  
  return matches;
}
