import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { Database, LogOut, Sparkles, ArrowRight, User, Zap, Clock } from 'lucide-react';
import { getUserTier, getTrialStatus, getUserTierLabel } from '@/lib/tier';
import { getMonthlyUsage } from '@/lib/usage';

import { PageBackground } from '@/components/ui/backgrounds/PageBackground';

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ upgraded?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Check if user was redirected from Stripe checkout (upgraded=true)
  const params = await searchParams;
  if (params.upgraded === 'true') {
    // Check if subscription needs to be updated
    const existingSub = await prisma.subscription.findUnique({ where: { userId: user.id } });
    if (existingSub && existingSub.status !== 'active') {
      // Update subscription to active - webhook didn't work, so we do it here as fallback
      await prisma.subscription.update({
        where: { userId: user.id },
        data: {
          status: 'active',
          plan: existingSub.plan === 'free' ? 'pro' : existingSub.plan,
        },
      });
    }
  }

  const [profile, subscription, recentBatches] = await Promise.all([
    prisma.profile.findUnique({ where: { id: user.id } }),
    prisma.subscription.findUnique({ where: { userId: user.id } }),
    prisma.migrationBatch.findMany({
      where: { userId: user.id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  // Compute tier info with single subscription object
  const [tierInfo, usage, trialStatus, tierLabel] = await Promise.all([
    getUserTier(user.id, subscription),
    getMonthlyUsage(user.id),
    getTrialStatus(user.id, subscription),
    getUserTierLabel(user.id, subscription),
  ]);

  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean);
  const isAdmin = adminEmails.includes(user.email ?? '');

  const batchLimit = tierInfo.batchesPerMonth === Infinity ? '∞' : tierInfo.batchesPerMonth;

  const DIALECT_LABELS: Record<string, string> = {
    sql_server: 'SQL Server', oracle: 'Oracle', mysql: 'MySQL', postgresql: 'PostgreSQL',
    snowflake_dbt: 'Snowflake (dbt)', bigquery: 'BigQuery', redshift: 'Redshift',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-emerald-500/20 bg-slate-950/80 shadow-lg shadow-emerald-500/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white">
            <Database className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
            <span className="font-bold tracking-tight">MorphDB</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-400">
              <User className="w-4 h-4" />
              {profile?.name?.split(' ')[0] ?? user.email?.split('@')[0]}
            </div>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm text-zinc-400 hover:text-white border border-emerald-500/20 rounded-full hover:bg-slate-900/50 backdrop-blur-md transition-colors">
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </nav>

      <PageBackground variant="intense" className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 mb-4">
              <Sparkles className="w-4 h-4 animate-pulse" />
              Early Access
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{profile?.name?.split(' ')[0] ?? 'there'}</span> 👋
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base">Your MorphDB migration dashboard.</p>
          </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-10">
          <div className="bg-slate-900/50 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-4 sm:p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="text-xl sm:text-3xl font-bold text-white mb-1">
              {tierLabel}
            </div>
            <div className="text-xs sm:text-sm font-medium text-zinc-300 mb-1">
              {tierLabel === 'Pro Trial' ? `${trialStatus.daysRemaining} days remaining` : 'Current Plan'}
            </div>
            <div className="text-xs text-zinc-500">{batchLimit} batches/mo</div>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-4 sm:p-6">
            <div className="text-xl sm:text-3xl font-bold text-white mb-1">{usage.batchCount}</div>
            <div className="text-xs sm:text-sm font-medium text-zinc-300 mb-1">Batches This Month</div>
            <div className="text-xs text-zinc-500">{batchLimit === '∞' ? 'Unlimited' : `of ${batchLimit} used`}</div>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-4 sm:p-6">
            <div className="text-xl sm:text-3xl font-bold text-white mb-1">{usage.translationCount}</div>
            <div className="text-xs sm:text-sm font-medium text-zinc-300 mb-1">Translations</div>
            <div className="text-xs text-zinc-500">
              {tierInfo.translationsPerMonth === Infinity ? 'Unlimited' : `of ${tierInfo.translationsPerMonth} used`}
            </div>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-4 sm:p-6">
            <div className="text-xl sm:text-3xl font-bold text-blue-400 mb-1">{usage.tokenCount.toLocaleString()}</div>
            <div className="text-xs sm:text-sm font-medium text-zinc-300 mb-1">Tokens Used</div>
            <div className="text-xs text-zinc-500">This month</div>
          </div>
        </div>

        {tierLabel === 'Free' && (
          <div className="mb-6 sm:mb-10 p-4 sm:p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-1 flex items-center gap-2">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" /> Start Your 3-Day Free Pro Trial
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400">Unlock Claude Sonnet, 50 files per batch, and priority support.</p>
            </div>
            <Link href="/#pricing" className="px-5 py-2 bg-white text-black text-sm font-semibold rounded-full hover:bg-zinc-200 transition-colors whitespace-nowrap">
              Start Free Trial
            </Link>
          </div>
        )}

        {trialStatus.isOnTrial && !tierLabel.startsWith('Pro') && !tierLabel.startsWith('Design') && !tierLabel.startsWith('Enterprise') && (
          <div className="mb-6 sm:mb-10 p-4 sm:p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-1 flex items-center gap-2">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> Your Pro Trial Ends in {trialStatus.daysRemaining} Days
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400">Upgrade now to continue using Pro features.</p>
            </div>
            <Link href="/#pricing" className="px-5 py-2 bg-white text-black text-sm font-semibold rounded-full hover:bg-zinc-200 transition-colors whitespace-nowrap">
              Upgrade Now
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center lg:items-start lg:text-left justify-center">
            <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400 mb-4 opacity-60" />
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Start a Migration</h2>
            <p className="text-zinc-400 text-sm mb-6 max-w-md">
              Upload SQL files or paste queries to translate between dialects with AI.
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <Link href="/dashboard/migrate" className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors text-sm">
                Batch Migration <ArrowRight className="w-4 h-4" />
              </Link>
              {isAdmin && (
                <Link href="/dashboard/admin" className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 text-sm text-zinc-400 hover:text-white border border-emerald-500/20 rounded-full hover:bg-slate-900/50 backdrop-blur-md transition-colors">
                  Admin Panel
                </Link>
              )}
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md border border-emerald-500/20 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-emerald-500/20">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-500" />
                <span className="text-sm font-medium text-zinc-300">Recent Migrations</span>
              </div>
              {recentBatches.length > 0 && (
                <Link href="/dashboard/history" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  View all
                </Link>
              )}
            </div>
            {recentBatches.length === 0 ? (
              <div className="px-6 py-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-slate-900/50 backdrop-blur-md rounded-full border border-emerald-500/20 flex items-center justify-center mb-4">
                  <Database className="w-6 h-6 text-zinc-600" />
                </div>
                <h3 className="text-sm font-medium text-zinc-300 mb-1">No migrations yet</h3>
                <p className="text-xs text-zinc-500 mb-6 max-w-[200px]">Run your first migration to see your history here.</p>
                <Link href="/dashboard/migrate" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/50 backdrop-blur-md text-zinc-300 hover:text-white hover:bg-white/10 text-xs font-medium rounded-full border border-emerald-500/20 transition-colors">
                  <Zap className="w-3.5 h-3.5" /> Start Migration
                </Link>
              </div>
            ) : (
              <div>
                {recentBatches.map((batch) => (
                  <div key={batch.id} className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${batch.failedCount === 0 ? 'bg-green-400' : batch.successCount === 0 ? 'bg-red-400' : 'bg-amber-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-zinc-300 truncate">
                        {DIALECT_LABELS[batch.sourceDialect] ?? batch.sourceDialect} → {DIALECT_LABELS[batch.targetDialect] ?? batch.targetDialect}
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        {batch.totalStatements} stmts •{' '}
                        <span className="text-green-400">{batch.successCount} ok</span>
                        {batch.failedCount > 0 && <span className="text-red-400"> {batch.failedCount} failed</span>}
                      </p>
                    </div>
                    <span className="text-[10px] text-zinc-600 shrink-0">
                      {new Date(batch.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
                <Link href="/dashboard/history" className="flex items-center justify-center gap-1 py-3 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                  View all history <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        </div>
        </div>
      </PageBackground>
    </div>
  );
}
