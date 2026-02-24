import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { Database, ArrowLeft, CheckCircle2, AlertTriangle, Clock, Zap, User, LogOut } from 'lucide-react';

const DIALECT_LABELS: Record<string, string> = {
  sql_server: 'SQL Server',
  oracle: 'Oracle',
  mysql: 'MySQL',
  postgresql: 'PostgreSQL',
  snowflake_dbt: 'Snowflake (dbt)',
  bigquery: 'BigQuery',
  redshift: 'Redshift',
};

const MODEL_LABELS: Record<string, string> = {
  'gpt-4o-mini': 'GPT-4o Mini',
  'claude-haiku': 'Claude Haiku',
  'claude-sonnet': 'Claude Sonnet',
};

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  const firstName = profile?.name?.split(' ')[0] ?? user.email?.split('@')[0];

  const batches = await prisma.migrationBatch.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" />
              <span className="font-bold tracking-tight">MorphDB</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {firstName && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-400">
                <User className="w-4 h-4" />
                {firstName}
              </div>
            )}
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-500 hover:text-white border border-white/10 rounded-full hover:bg-white/5 transition-colors">
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </form>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">Migration History</h1>
            <p className="text-zinc-400 text-sm">Your last {batches.length} batch translations.</p>
          </div>
          <Link href="/dashboard/migrate" className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-semibold rounded-full hover:bg-zinc-200 transition-colors">
            <Zap className="w-4 h-4" /> New Migration
          </Link>
        </div>

        {batches.length === 0 ? (
          <div className="text-center py-24 bg-white/[0.02] border border-white/10 rounded-2xl">
            <Clock className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-zinc-300 mb-2">No migrations yet</h2>
            <p className="text-zinc-500 text-sm mb-6">Run your first batch migration to see the history here.</p>
            <Link href="/dashboard/migrate" className="px-6 py-2.5 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors">
              Start Migrating
            </Link>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-6 py-3 border-b border-white/10 text-xs text-zinc-500 uppercase tracking-wider">
              <span>Migration</span>
              <span>Model</span>
              <span>Results</span>
              <span>Tokens</span>
              <span>Date</span>
            </div>
            {batches.map((batch) => (
              <div key={batch.id} className="px-4 sm:px-6 py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <div className="flex flex-col sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto] sm:gap-4 sm:items-center gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-zinc-200">
                        {DIALECT_LABELS[batch.sourceDialect] ?? batch.sourceDialect}
                      </span>
                      <span className="text-zinc-600">→</span>
                      <span className="text-sm font-medium text-blue-400">
                        {DIALECT_LABELS[batch.targetDialect] ?? batch.targetDialect}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">{batch.totalStatements} statements</p>
                  </div>
                  <span className="text-xs text-zinc-400 bg-white/5 px-2 py-1 rounded w-fit">
                    {MODEL_LABELS[batch.model] ?? batch.model}
                  </span>
                  <div className="flex items-center gap-2 text-sm">
                    {batch.successCount > 0 && (
                      <span className="flex items-center gap-1 text-green-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {batch.successCount}
                      </span>
                    )}
                    {batch.failedCount > 0 && (
                      <span className="flex items-center gap-1 text-red-400">
                        <AlertTriangle className="w-3.5 h-3.5" /> {batch.failedCount}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-zinc-500">{batch.totalTokens.toLocaleString()} tokens</span>
                  <span className="text-xs text-zinc-500">
                    {new Date(batch.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
