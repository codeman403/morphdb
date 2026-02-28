'use client';

import React from 'react';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import CodeBlock from '@/components/docs/CodeBlock';

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

const docContent: Record<string, { title: string; content: React.ReactNode }> = {
  // Section Index Pages
  'get-started': {
    title: 'Getting Started',
    content: (
      <div className="space-y-6">
        <p className="text-lg text-zinc-300">
          Learn the basics of MorphDB and get up and running in minutes.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/docs/get-started/introduction" className="block p-6 border border-emerald-500/20 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition">
            <h3 className="text-lg font-semibold mb-2 text-white">Introduction</h3>
            <p className="text-sm text-zinc-300">Learn what MorphDB is and what it can do</p>
          </Link>
          <Link href="/docs/get-started/quick-start" className="block p-6 border border-emerald-500/20 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition">
            <h3 className="text-lg font-semibold mb-2 text-white">Quick Start</h3>
            <p className="text-sm text-zinc-300">Get up and running in just a few minutes</p>
          </Link>
          <Link href="/docs/get-started/authentication" className="block p-6 border border-emerald-500/20 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition">
            <h3 className="text-lg font-semibold mb-2 text-white">Authentication</h3>
            <p className="text-sm text-zinc-300">Set up secure access to MorphDB</p>
          </Link>
          <Link href="/docs/get-started/api-keys" className="block p-6 border border-emerald-500/20 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition">
            <h3 className="text-lg font-semibold mb-2 text-white">API Keys</h3>
            <p className="text-sm text-zinc-300">Create and manage API keys for programmatic access</p>
          </Link>
        </div>
      </div>
    ),
  },

  'features': {
    title: 'Features',
    content: (
      <div className="space-y-6">
        <p className="text-lg text-zinc-300">
          Explore the powerful features that make MorphDB the best choice for database migrations.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/docs/features/soft-delete" className="block p-6 border border-emerald-500/20 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition">
            <h3 className="text-lg font-semibold mb-2 text-white">Soft Delete & Audit Trail</h3>
            <p className="text-sm text-zinc-300">Safely delete migration batches with complete audit history</p>
          </Link>
          <Link href="/docs/features/batch-cancellation" className="block p-6 border border-emerald-500/20 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition">
            <h3 className="text-lg font-semibold mb-2 text-white">Batch Cancellation</h3>
            <p className="text-sm text-zinc-300">Cancel long-running migrations without losing progress</p>
          </Link>
          <Link href="/docs/features/enhanced-logging" className="block p-6 border border-emerald-500/20 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition">
            <h3 className="text-lg font-semibold mb-2 text-white">Enhanced Logging & Privacy</h3>
            <p className="text-sm text-zinc-300">All actions logged with automatic privacy protection</p>
          </Link>
          <Link href="/docs/features/security" className="block p-6 border border-emerald-500/20 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition">
            <h3 className="text-lg font-semibold mb-2 text-white">Security</h3>
            <p className="text-sm text-zinc-300">Enterprise-grade security and compliance features</p>
          </Link>
        </div>
      </div>
    ),
  },

  'troubleshooting': {
    title: 'Troubleshooting',
    content: (
      <div className="space-y-6">
        <p className="text-lg text-zinc-300">
          Find solutions to common issues and learn best practices.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/docs/troubleshooting/common-issues" className="block p-6 border border-emerald-500/20 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition">
            <h3 className="text-lg font-semibold mb-2 text-white">Common Issues</h3>
            <p className="text-sm text-zinc-300">Solutions to frequently encountered problems</p>
          </Link>
          <Link href="/docs/troubleshooting/faq" className="block p-6 border border-emerald-500/20 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition">
            <h3 className="text-lg font-semibold mb-2 text-white">FAQ</h3>
            <p className="text-sm text-zinc-300">Answers to frequently asked questions</p>
          </Link>
          <Link href="/docs/troubleshooting/error-codes" className="block p-6 border border-emerald-500/20 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition">
            <h3 className="text-lg font-semibold mb-2 text-white">Error Codes</h3>
            <p className="text-sm text-zinc-300">Reference guide for error codes and solutions</p>
          </Link>
          <Link href="/docs/troubleshooting/performance" className="block p-6 border border-emerald-500/20 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition">
            <h3 className="text-lg font-semibold mb-2 text-white">Performance</h3>
            <p className="text-sm text-zinc-300">Tips for optimizing migration performance</p>
          </Link>
        </div>
      </div>
    ),
  },

  'api-reference': {
    title: 'API Reference',
    content: (
      <div className="space-y-6">
        <p className="text-lg text-zinc-300">
          Complete reference for the MorphDB API.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/docs/api-reference/endpoints" className="block p-6 border border-emerald-500/20 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition">
            <h3 className="text-lg font-semibold mb-2 text-white">Endpoints</h3>
            <p className="text-sm text-zinc-300">Available API endpoints and methods</p>
          </Link>
          <Link href="/docs/api-reference/authentication" className="block p-6 border border-emerald-500/20 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition">
            <h3 className="text-lg font-semibold mb-2 text-white">Authentication</h3>
            <p className="text-sm text-zinc-300">How to authenticate API requests</p>
          </Link>
          <Link href="/docs/api-reference/rate-limiting" className="block p-6 border border-emerald-500/20 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition">
            <h3 className="text-lg font-semibold mb-2 text-white">Rate Limiting</h3>
            <p className="text-sm text-zinc-300">Rate limit policies and best practices</p>
          </Link>
        </div>
      </div>
    ),
  },

  // Get Started Pages
  'get-started/introduction': {
    title: 'Introduction to MorphDB',
    content: (
      <div className="space-y-6">
        <p className="text-lg text-zinc-300">
          MorphDB is an AI-powered database migration platform designed for data engineers. It helps you translate legacy SQL dialects into modern data warehouse formats safely and efficiently.
        </p>

        <div className="bg-emerald-950/20 border border-emerald-800/50 rounded-lg p-6">
          <h3 className="font-semibold text-white mb-2">What You Can Do</h3>
          <ul className="space-y-2 text-zinc-300">
            <li className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Translate SQL from SQL Server, Oracle, MySQL, and PostgreSQL</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Convert to Snowflake, BigQuery, PostgreSQL, or Redshift</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Maintain complete audit trails of all migrations</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Cancel in-progress migrations without data loss</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>Leverage AI to handle complex translations</span>
            </li>
          </ul>
        </div>

        <h2 className="text-2xl font-bold text-white pt-4">Getting Started</h2>
        <p>
          Ready to start? Head over to the{' '}
          <Link href="/docs/get-started/quick-start" className="text-emerald-600 dark:text-emerald-400 hover:underline">
            Quick Start guide
          </Link>
          {' '}to set up your first migration in minutes.
        </p>
      </div>
    ),
  },

  'get-started/quick-start': {
    title: 'Quick Start Guide',
    content: (
      <div className="space-y-6">
        <p className="text-lg text-zinc-300">
          Get up and running with MorphDB in just a few minutes.
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
              Sign Up
            </h3>
            <p className="text-zinc-300 ml-8">
              Create your free MorphDB account. You get 3 days of free trial with full feature access.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
              Prepare Your SQL
            </h3>
            <p className="text-zinc-300 ml-8">
              Have your legacy SQL queries or database schema ready. You can paste SQL code or upload files.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
              Configure Translation
            </h3>
            <p className="text-zinc-300 ml-8">
              Select your source database type and target platform. The AI will handle the rest.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
              Review & Export
            </h3>
            <p className="text-zinc-300 ml-8">
              Review the translated SQL, make adjustments if needed, and export the results.
            </p>
          </div>
        </div>

        <div className="bg-amber-900/8 border border-amber-800/20 rounded-lg p-6">
          <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            Pro Tip
          </h3>
          <p className="text-zinc-300">
            Start with a small SQL query to understand how MorphDB works. Then migrate your complete database schema.
          </p>
        </div>
      </div>
    ),
  },

  'get-started/authentication': {
    title: 'Authentication',
    content: (
      <div className="space-y-6">
        <p className="text-zinc-300">
          MorphDB uses secure authentication to protect your data and migrations.
        </p>

        <h3 className="text-xl font-semibold text-white">Sign Up & Login</h3>
        <p className="text-zinc-300">
          Create your account on the{' '}
          <Link href="/login" className="text-emerald-600 dark:text-emerald-400 hover:underline">
            login page
          </Link>
          . We support email/password authentication via Supabase.
        </p>

        <h3 className="text-xl font-semibold text-white">Free Trial</h3>
        <p className="text-zinc-300">
          New users get a 3-day free trial with full access to all features. No credit card required for the trial.
        </p>

        <h3 className="text-xl font-semibold text-white">Sessions</h3>
         <p className="text-zinc-300">
            Your session is managed securely and automatically. You&apos;ll be logged out after 15 minutes of inactivity for security.
          </p>
      </div>
    ),
  },

  // Features Pages
  'features/soft-delete': {
    title: 'Soft Delete & Audit Trail',
    content: (
      <div className="space-y-6">
        <p className="text-lg text-zinc-300">
          Safely delete migration batches with complete audit history for compliance and troubleshooting.
        </p>

        <h3 className="text-xl font-semibold text-white">What is Soft Delete?</h3>
        <p className="text-zinc-300">
           When you delete a migration batch, it&apos;s marked as deleted but the data is never actually removed from our systems. This ensures complete compliance and gives you an immutable audit trail of all actions.
         </p>

        <h3 className="text-xl font-semibold text-white">How It Works</h3>
        <ul className="space-y-2 text-zinc-300 ml-4">
          <li className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>Batch is marked as deleted but remains in the database</span>
          </li>
          <li className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>Users can&apos;t access deleted batches in their history</span>
          </li>
          <li className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>Admins can view the complete audit trail</span>
          </li>
          <li className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>Audit logs are kept for 90 days</span>
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-white">Benefits</h3>
        <ul className="space-y-2 text-zinc-300 ml-4">
          <li>✓ Complete audit trail for regulatory requirements</li>
          <li>✓ Troubleshoot issues by reviewing deleted operations</li>
          <li>✓ Data safety - nothing is truly deleted</li>
        </ul>
      </div>
    ),
  },

  'features/batch-cancellation': {
    title: 'Batch Cancellation',
    content: (
      <div className="space-y-6">
        <p className="text-lg text-zinc-300">
          Cancel long-running migrations at any time without losing your progress.
        </p>

        <h3 className="text-xl font-semibold text-white">How It Works</h3>
        <p className="text-zinc-300">
          When you cancel a batch:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-zinc-300 ml-2">
          <li>The currently processing statement is completed</li>
          <li>All remaining statements are marked as cancelled</li>
          <li>You can view partial results immediately</li>
        </ol>

        <h3 className="text-xl font-semibold text-white">Key Features</h3>
        <ul className="space-y-2 text-zinc-300 ml-4">
          <li className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>Cancellation is safe and idempotent</span>
          </li>
          <li className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>No data loss when cancelling</span>
          </li>
          <li className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>You can cancel multiple times without issues</span>
          </li>
          <li className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>View which statements were processed vs cancelled</span>
          </li>
        </ul>
      </div>
    ),
  },

  'features/enhanced-logging': {
    title: 'Enhanced Logging & Privacy',
    content: (
      <div className="space-y-6">
        <p className="text-lg text-zinc-300">
          All actions are logged with automatic privacy protection built in.
        </p>

        <h3 className="text-xl font-semibold text-white">What We Log</h3>
        <ul className="space-y-2 text-zinc-300 ml-4">
          <li>• Batch creation and updates</li>
          <li>• Migration progress and completion</li>
          <li>• Cancellations and deletions</li>
          <li>• All admin actions</li>
          <li>• System errors and troubleshooting information</li>
        </ul>

        <h3 className="text-xl font-semibold text-white">Privacy by Default</h3>
        <p className="text-zinc-300">
          All sensitive information is automatically protected:
        </p>
        <ul className="space-y-2 text-zinc-300 ml-4">
          <li className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>Email addresses are hashed with SHA-256</span>
          </li>
          <li className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>IP addresses are masked to CIDR blocks</span>
          </li>
          <li className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>Device fingerprints are removed</span>
          </li>
          <li className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>Connection strings and API keys are never logged</span>
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-white">Structured Logging</h3>
        <p className="text-zinc-300">
          Our logs are machine-readable JSON, making them easy to search and analyze. Each log entry includes a timestamp and request ID for tracing.
        </p>
      </div>
    ),
  },

  'features/security': {
    title: 'Security',
    content: (
      <div className="space-y-6">
        <p className="text-lg text-zinc-300">
          MorphDB is built with security and compliance as core principles.
        </p>

        <h3 className="text-xl font-semibold text-white">Security Features</h3>
        <ul className="space-y-3 text-zinc-300 ml-4">
          <li className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>HTTPS encryption for all data in transit</span>
          </li>
          <li className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>At-rest encryption for databases</span>
          </li>
          <li className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>Role-based access control (RBAC)</span>
          </li>
          <li className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>Audit logging for all operations</span>
          </li>
          <li className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span>Regular security audits and penetration testing</span>
          </li>
        </ul>
      </div>
    ),
  },

  // Troubleshooting Pages
  'troubleshooting/common-issues': {
    title: 'Common Issues',
    content: (
      <div className="space-y-6">
        <p className="text-zinc-300">
          Solutions to frequently encountered problems.
        </p>

        <div>
          <h3 className="text-xl font-semibold text-white mb-3">Migration is taking too long</h3>
          <p className="text-zinc-300 mb-2">
            If your migration is running slower than expected:
          </p>
          <ul className="list-disc list-inside space-y-1 text-zinc-300 ml-2">
            <li>Try cancelling and running smaller batches</li>
            <li>Check your network connectivity</li>
            <li>Ensure your SQL queries are optimized</li>
            <li>Contact support if the issue persists</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-3">Translation errors</h3>
          <p className="text-zinc-300 mb-2">
             If MorphDB can&apos;t translate some SQL statements:
          </p>
          <ul className="list-disc list-inside space-y-1 text-zinc-300 ml-2">
            <li>Some proprietary SQL features may not be automatically translatable</li>
            <li>You can manually review and adjust the translated output</li>
            <li>Submit a support ticket with examples for us to improve</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-3">Free trial expired</h3>
          <p className="text-zinc-300 mb-2">
            If your 3-day trial ended:
          </p>
          <ul className="list-disc list-inside space-y-1 text-zinc-300 ml-2">
            <li>Upgrade to a paid plan or it will be downgraded to Free plan</li>
            <li>Contact us about special pricing for your use case</li>
          </ul>
        </div>
      </div>
    ),
  },

  'troubleshooting/faq': {
    title: 'Frequently Asked Questions',
    content: (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Can I recover a deleted batch?</h3>
          <p className="text-zinc-300">
            No, soft-deleted batches cannot be recovered by users. However, MorphDB admins can access the audit log to review what was deleted and when.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Will cancelling a batch lose my progress?</h3>
          <p className="text-zinc-300">
            No. When you cancel a batch, all the statements that were already processed remain in your history. Only the remaining statements are marked as cancelled.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-2">How long are audit logs kept?</h3>
          <p className="text-zinc-300">
            Audit logs are kept for 90 days. After that, they are automatically deleted. This complies with common data retention policies while maintaining reasonable audit history.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Can I see the audit logs?</h3>
          <p className="text-zinc-300">
            Only MorphDB administrators can view audit logs. This ensures sensitive operational data remains protected while maintaining full compliance.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Is my personal data safe in the logs?</h3>
          <p className="text-zinc-300">
            Yes. All sensitive information is automatically protected: emails are hashed, IPs are masked, and device fingerprints are removed. Your personal data is never exposed, even in error messages.
          </p>
        </div>
      </div>
    ),
  },

  'troubleshooting/error-codes': {
    title: 'Error Codes',
    content: (
      <div className="space-y-6">
        <p className="text-zinc-300">
          Common error codes and their meanings.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-emerald-500/20">
                <th className="text-left py-3 px-4 font-semibold text-white">Code</th>
                <th className="text-left py-3 px-4 font-semibold text-white">Meaning</th>
                <th className="text-left py-3 px-4 font-semibold text-white">Solution</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-emerald-500/20">
                <td className="py-3 px-4 font-mono text-red-500">400</td>
                <td className="py-3 px-4 text-zinc-300">Bad Request</td>
                <td className="py-3 px-4 text-zinc-300">Check your request parameters</td>
              </tr>
              <tr className="border-b border-emerald-500/20">
                <td className="py-3 px-4 font-mono text-red-500">403</td>
                <td className="py-3 px-4 text-zinc-300">Forbidden</td>
                 <td className="py-3 px-4 text-zinc-300">You don&apos;t have permission for this action</td>
              </tr>
              <tr className="border-b border-emerald-500/20">
                <td className="py-3 px-4 font-mono text-red-500">429</td>
                <td className="py-3 px-4 text-zinc-300">Rate Limited</td>
                <td className="py-3 px-4 text-zinc-300">Wait before making more requests</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-mono text-red-500">500</td>
                <td className="py-3 px-4 text-zinc-300">Server Error</td>
                <td className="py-3 px-4 text-zinc-300">Contact support</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
  },

  'troubleshooting/performance': {
    title: 'Performance Optimization',
    content: (
      <div className="space-y-6">
        <p className="text-zinc-300">
          Tips for optimizing your migration performance.
        </p>

        <h3 className="text-xl font-semibold text-white">Batch Size</h3>
        <p className="text-zinc-300">
          Process smaller batches for faster results. Breaking large migrations into 50-100 statement chunks often improves performance.
        </p>

        <h3 className="text-xl font-semibold text-white">Network Connectivity</h3>
        <p className="text-zinc-300">
          Ensure you have a stable internet connection. Poor connectivity can significantly slow down the migration process.
        </p>

        <h3 className="text-xl font-semibold text-white">SQL Optimization</h3>
        <p className="text-zinc-300">
          Pre-optimize your SQL queries before migration. Remove unnecessary complexity and ensure queries follow best practices.
        </p>

        <h3 className="text-xl font-semibold text-white">Parallel Migrations</h3>
        <p className="text-zinc-300">
          Run multiple migrations in parallel. The system can handle several concurrent translation batches.
        </p>
      </div>
    ),
  },

  // API Reference Pages
  'api-reference/endpoints': {
    title: 'API Endpoints',
    content: (
      <div className="space-y-6">
        <p className="text-zinc-300">
          Complete API endpoint reference for MorphDB.
        </p>

        <div className="space-y-6">
          <div className="bg-slate-900/50 backdrop-blur-md rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-emerald-500 text-white px-2 py-1 rounded text-xs font-mono">POST</span>
              <code className="text-gray-300 font-mono text-sm">/api/migrate/batch</code>
            </div>
            <p className="text-zinc-400 text-sm">Create a new migration batch</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-mono">GET</span>
              <code className="text-gray-300 font-mono text-sm">/api/migrate/batch/{'{id}'}</code>
            </div>
            <p className="text-zinc-400 text-sm">Get migration batch details</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-mono">POST</span>
              <code className="text-gray-300 font-mono text-sm">/api/migrate/batch/{'{id}'}/cancel</code>
            </div>
            <p className="text-zinc-400 text-sm">Cancel a migration batch</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-mono">DELETE</span>
              <code className="text-gray-300 font-mono text-sm">/api/migrate/batch/{'{id}'}</code>
            </div>
            <p className="text-zinc-400 text-sm">Delete a migration batch</p>
          </div>
        </div>

        <p className="text-zinc-300">
          For detailed endpoint documentation with request/response examples, see the next sections.
        </p>
      </div>
    ),
  },

  'api-reference/authentication': {
    title: 'API Authentication',
    content: (
      <div className="space-y-6">
        <p className="text-zinc-300">
          All API requests must include authentication.
        </p>

        <h3 className="text-xl font-semibold text-white">Bearer Token</h3>
        <p className="text-zinc-300 mb-3">
          Include your API key as a Bearer token in the Authorization header:
        </p>
        <pre className="bg-slate-900/50 backdrop-blur-md text-zinc-100 p-4 rounded-lg overflow-x-auto mb-4">
          <code>{`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://api.morphdb.io/api/migrate/batch`}</code>
        </pre>

        <h3 className="text-xl font-semibold text-white">Session Authentication</h3>
        <p className="text-zinc-300">
          For web requests from the dashboard, session authentication is handled automatically.
        </p>
      </div>
    ),
  },

  'api-reference/rate-limiting': {
    title: 'Rate Limiting',
    content: (
      <div className="space-y-6">
        <p className="text-zinc-300">
          MorphDB API implements rate limiting to ensure fair usage and system stability.
        </p>

        <h3 className="text-xl font-semibold text-white">Rate Limits</h3>
        <ul className="space-y-2 text-zinc-300 ml-4">
          <li>• <strong>Free tier:</strong> 100 requests per hour</li>
          <li>• <strong>Pro tier:</strong> 1,000 requests per hour</li>
          <li>• <strong>Enterprise:</strong> Custom limits</li>
        </ul>

        <h3 className="text-xl font-semibold text-white">Rate Limit Headers</h3>
        <p className="text-zinc-300">
          Each response includes rate limit information:
        </p>
        <pre className="bg-slate-900/50 backdrop-blur-md text-zinc-100 p-4 rounded-lg overflow-x-auto">
          <code>{`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890`}</code>
        </pre>
      </div>
    ),
  },

  // Changelog
  'changelog': {
    title: 'Changelog',
    content: (
      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Version 2.2.0 - 2026-02-28</h3>
          <p className="text-sm text-zinc-400 mb-3">Enhanced Admin & Compliance Features</p>
          <ul className="space-y-2 text-zinc-300 ml-4">
            <li className="flex gap-3">
              <span className="text-green-500">✓</span>
              <span>Multi-template professional email system with 11+ email templates</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500">✓</span>
              <span>Admin email management: welcome emails and trial reminders</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500">✓</span>
              <span>Support ticket management with automatic closure notifications</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500">✓</span>
              <span>Comprehensive audit logging system with PII protection (SHA-256 hashing, IP anonymization)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500">✓</span>
              <span>Soft delete pattern for batches with data recovery capability</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500">✓</span>
              <span>Batch cancellation support with statement-level state preservation</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500">✓</span>
              <span>Advanced data visualization components (DataFlow, SchemaVisualization)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500">✓</span>
              <span>Full-text documentation search across all pages and content</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500">✓</span>
              <span>Enhanced dashboard with animated background effects</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500">✓</span>
              <span>Loading state animations with skeleton screens</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500">✓</span>
              <span>Rate limiting on admin endpoints (20-30 req/min)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500">✓</span>
              <span>90-day audit log retention for GDPR compliance</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500">✓</span>
              <span>UUID migration for consistent ID generation</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500">✓</span>
              <span>Public navigation component with session awareness</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500">✓</span>
              <span>Dynamic documentation platform with searchable navigation</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Version 2.1.0 - 2026-02-27</h3>
          <p className="text-sm text-zinc-400 mb-3">Audit & Compliance Baseline</p>
          <ul className="space-y-2 text-zinc-300 ml-4">
            <li className="flex gap-3">
              <span className="text-green-500">✓</span>
              <span>Implemented soft delete with 90-day audit retention</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500">✓</span>
              <span>Added batch cancellation with partial results</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500">✓</span>
              <span>Enhanced logging with PII masking</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500">✓</span>
              <span>Added comprehensive documentation site</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Version 2.0.0 - 2026-02-01</h3>
          <p className="text-sm text-zinc-400 mb-3">Framework Migration</p>
          <ul className="space-y-2 text-zinc-300 ml-4">
            <li className="flex gap-3">
              <span className="text-green-500">✓</span>
              <span>Upgraded to Next.js 16 with App Router</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500">✓</span>
              <span>Migrated to Tailwind CSS v4</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500">✓</span>
              <span>Redesigned admin panel</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Version 1.5.0 - 2025-12-15</h3>
          <p className="text-sm text-zinc-400 mb-3">Platform Expansion</p>
          <ul className="space-y-2 text-zinc-300 ml-4">
            <li className="flex gap-3">
              <span className="text-green-500">✓</span>
              <span>Added support for Redshift as target platform</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-500">✓</span>
              <span>Improved translation accuracy for complex queries</span>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
};

export default function DocPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const slug = resolvedParams.slug.join('/');
  const doc = docContent[slug];

  if (!doc) {
    notFound();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">{doc.title}</h1>
        <div className="h-1 w-24 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded" />
      </div>

      <div className="prose prose-invert max-w-none text-zinc-300">
        {doc.content}
      </div>

      <div className="mt-12 pt-8 border-t border-emerald-500/20">
        <p className="text-sm text-zinc-400">
           Can&apos;t find what you&apos;re looking for?{' '}
          <Link href="/support" className="text-emerald-400 hover:text-emerald-300 hover:underline">
            Contact our support team
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
