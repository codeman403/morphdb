'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Database, ArrowLeft, Users, LogIn, CreditCard, Clock,
  Globe, Monitor, Mail, Building2, Shield, RefreshCw,
} from 'lucide-react';

interface WaitlistEntry {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  tier: string;
  createdAt: string;
}

interface LoginLog {
  id: string;
  userId: string;
  email: string | null;
  ip: string | null;
  country: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface Profile {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  createdAt: string;
}

interface Stats {
  waitlist: { count: number; entries: WaitlistEntry[] };
  logins: LoginLog[];
  subscriptions: { plan: string; _count: { plan: number } }[];
  recentSignups: Profile[];
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function parseBrowser(ua: string | null) {
  if (!ua) return 'Unknown';
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edg')) return 'Edge';
  return 'Other';
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'waitlist' | 'logins' | 'signups'>('waitlist');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch');
      }
      setStats(await res.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex items-center gap-3 text-zinc-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Loading admin dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-zinc-400 mb-6">{error}</p>
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { label: 'Waitlist Signups', value: stats.waitlist.count, icon: Users, color: 'blue' },
    { label: 'Login Events', value: stats.logins.length, icon: LogIn, color: 'green' },
    { label: 'Total Users', value: stats.recentSignups.length, icon: Mail, color: 'purple' },
    { label: 'Subscriptions', value: stats.subscriptions.reduce((a, s) => a + s._count.plan, 0), icon: CreditCard, color: 'amber' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  };

  const tabs = [
    { key: 'waitlist' as const, label: 'Waitlist', icon: Users, count: stats.waitlist.count },
    { key: 'logins' as const, label: 'Login Logs', icon: LogIn, count: stats.logins.length },
    { key: 'signups' as const, label: 'Users', icon: Mail, count: stats.recentSignups.length },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <Database className="w-6 h-6 text-blue-500" />
              <span className="font-bold text-lg tracking-tight">MorphDB</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-medium">Admin</span>
            </div>
          </div>
          <button
            onClick={fetchStats}
            className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white border border-white/10 rounded-full hover:bg-white/5 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-zinc-400">{card.label}</span>
                <div className={`p-2 rounded-lg border ${colorMap[card.color]}`}>
                  <card.icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold">{card.value}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-full border transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-black border-white font-medium'
                  : 'text-zinc-400 border-white/10 hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-black/10' : 'bg-white/10'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          {activeTab === 'waitlist' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-zinc-400 font-medium">Email</th>
                    <th className="text-left p-4 text-zinc-400 font-medium">Name</th>
                    <th className="text-left p-4 text-zinc-400 font-medium">Company</th>
                    <th className="text-left p-4 text-zinc-400 font-medium">Tier</th>
                    <th className="text-left p-4 text-zinc-400 font-medium">Signed Up</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.waitlist.entries.map((entry) => (
                    <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono text-blue-400">{entry.email}</td>
                      <td className="p-4 text-zinc-300">{entry.name ?? '—'}</td>
                      <td className="p-4 text-zinc-300 flex items-center gap-1.5">
                        {entry.company && <Building2 className="w-3.5 h-3.5 text-zinc-500" />}
                        {entry.company ?? '—'}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400">
                          {entry.tier}
                        </span>
                      </td>
                      <td className="p-4 text-zinc-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {timeAgo(entry.createdAt)}
                      </td>
                    </tr>
                  ))}
                  {stats.waitlist.entries.length === 0 && (
                    <tr><td colSpan={5} className="p-8 text-center text-zinc-500">No waitlist entries yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'logins' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-zinc-400 font-medium">Email</th>
                    <th className="text-left p-4 text-zinc-400 font-medium">IP</th>
                    <th className="text-left p-4 text-zinc-400 font-medium">Country</th>
                    <th className="text-left p-4 text-zinc-400 font-medium">Browser</th>
                    <th className="text-left p-4 text-zinc-400 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.logins.map((log) => (
                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono text-green-400">{log.email ?? '—'}</td>
                      <td className="p-4 text-zinc-300 font-mono text-xs">{log.ip ?? '—'}</td>
                      <td className="p-4 text-zinc-300 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-zinc-500" />
                        {log.country ?? '—'}
                      </td>
                      <td className="p-4 text-zinc-300 flex items-center gap-1.5">
                        <Monitor className="w-3.5 h-3.5 text-zinc-500" />
                        {parseBrowser(log.userAgent)}
                      </td>
                      <td className="p-4 text-zinc-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {timeAgo(log.createdAt)}
                      </td>
                    </tr>
                  ))}
                  {stats.logins.length === 0 && (
                    <tr><td colSpan={5} className="p-8 text-center text-zinc-500">No login events yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'signups' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-zinc-400 font-medium">Email</th>
                    <th className="text-left p-4 text-zinc-400 font-medium">Name</th>
                    <th className="text-left p-4 text-zinc-400 font-medium">Company</th>
                    <th className="text-left p-4 text-zinc-400 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentSignups.map((profile) => (
                    <tr key={profile.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono text-purple-400">{profile.email}</td>
                      <td className="p-4 text-zinc-300">{profile.name ?? '—'}</td>
                      <td className="p-4 text-zinc-300 flex items-center gap-1.5">
                        {profile.company && <Building2 className="w-3.5 h-3.5 text-zinc-500" />}
                        {profile.company ?? '—'}
                      </td>
                      <td className="p-4 text-zinc-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {timeAgo(profile.createdAt)}
                      </td>
                    </tr>
                  ))}
                  {stats.recentSignups.length === 0 && (
                    <tr><td colSpan={4} className="p-8 text-center text-zinc-500">No users yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
