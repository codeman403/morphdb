import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { Database, LogOut, Sparkles, ArrowRight, User } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const profile = await prisma.profile.findUnique({ where: { id: user.id } });

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white">
            <Database className="w-6 h-6 text-blue-500" />
            <span className="font-bold text-lg tracking-tight">MorphDB</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <User className="w-4 h-4" />
              {profile?.name ?? user.email}
            </div>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white border border-white/10 rounded-full hover:bg-white/5 transition-colors">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </form>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-16">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400 mb-4">
            <Sparkles className="w-4 h-4 animate-pulse" />
            Early Access
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{profile?.name?.split(' ')[0] ?? 'there'}</span> 👋
          </h1>
          <p className="text-zinc-400">Your MorphDB migration dashboard. More features coming soon.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Migrations Run', value: '0', sub: 'Start your first below' },
            { label: 'Tables Processed', value: '0', sub: 'Ready to migrate' },
            { label: 'Hours Saved', value: '0h', sub: 'Pending first run' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-zinc-300 mb-1">{stat.label}</div>
              <div className="text-xs text-zinc-500">{stat.sub}</div>
            </div>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <Sparkles className="w-12 h-12 text-blue-400 mx-auto mb-4 opacity-60" />
          <h2 className="text-2xl font-bold text-white mb-2">Your Migration Workspace</h2>
          <p className="text-zinc-400 mb-6 max-w-md mx-auto">
            The full migration engine is being built right now. As an early access member, you&apos;ll be the first to try it.
          </p>
          <Link href="/demo" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors">
            Try the Demo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
