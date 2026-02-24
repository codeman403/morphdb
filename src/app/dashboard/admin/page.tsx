'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, ArrowLeft, Users, LogIn, CreditCard, Clock,
  Globe, Monitor, Mail, Building2, Shield, RefreshCw, Headphones, RotateCcw, X, AlertTriangle,
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

interface SupportTicket {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  waitlist: { count: number; entries: WaitlistEntry[] };
  logins: LoginLog[];
  subscriptions: { plan: string; _count: { plan: number } }[];
  recentSignups: Profile[];
  supportTickets: SupportTicket[];
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
  const [activeTab, setActiveTab] = useState<'waitlist' | 'logins' | 'signups' | 'support'>('waitlist');
  const [resetting, setResetting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showGrantProModal, setShowGrantProModal] = useState(false);
  const [grantProUserId, setGrantProUserId] = useState('');
  const [grantingPro, setGrantingPro] = useState(false);

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
    { label: 'Support Tickets', value: stats.supportTickets.length, icon: Headphones, color: 'cyan' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  };

  const tabs = [
    { key: 'waitlist' as const, label: 'Waitlist', icon: Users, count: stats.waitlist.count },
    { key: 'logins' as const, label: 'Login Logs', icon: LogIn, count: stats.logins.length },
    { key: 'signups' as const, label: 'Users', icon: Mail, count: stats.recentSignups.length },
    { key: 'support' as const, label: 'Support Tickets', icon: Headphones, count: stats.supportTickets.length },
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGrantProModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-green-400 hover:text-green-300 border border-green-500/20 rounded-full hover:bg-green-500/10 transition-colors"
            >
              Grant Pro
            </button>
            <button
              onClick={() => setShowResetModal(true)}
              disabled={resetting}
              className="flex items-center gap-2 px-4 py-2 text-sm text-amber-400 hover:text-amber-300 border border-amber-500/20 rounded-full hover:bg-amber-500/10 transition-colors disabled:opacity-50"
            >
              <RotateCcw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} /> {resetting ? 'Resetting...' : 'Reset Usage'}
            </button>
            <button
              onClick={fetchStats}
              className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white border border-white/10 rounded-full hover:bg-white/5 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
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
                      <td className="p-4 text-zinc-300">
                        <span className="flex items-center gap-1.5">
                          {entry.company && <Building2 className="w-3.5 h-3.5 text-zinc-500" />}
                          {entry.company ?? '—'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400">
                          {entry.tier}
                        </span>
                      </td>
                      <td className="p-4 text-zinc-500">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {timeAgo(entry.createdAt)}
                        </span>
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
                      <td className="p-4 text-zinc-300">
                        <span className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-zinc-500" />
                          {log.country ?? '—'}
                        </span>
                      </td>
                      <td className="p-4 text-zinc-300">
                        <span className="flex items-center gap-1.5">
                          <Monitor className="w-3.5 h-3.5 text-zinc-500" />
                          {parseBrowser(log.userAgent)}
                        </span>
                      </td>
                      <td className="p-4 text-zinc-500">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {timeAgo(log.createdAt)}
                        </span>
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
                      <td className="p-4 text-zinc-300">
                        <span className="flex items-center gap-1.5">
                          {profile.company && <Building2 className="w-3.5 h-3.5 text-zinc-500" />}
                          {profile.company ?? '—'}
                        </span>
                      </td>
                      <td className="p-4 text-zinc-500">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {timeAgo(profile.createdAt)}
                        </span>
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

          {activeTab === 'support' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-zinc-400 font-medium">Name</th>
                    <th className="text-left p-4 text-zinc-400 font-medium">Email</th>
                    <th className="text-left p-4 text-zinc-400 font-medium">Subject</th>
                    <th className="text-left p-4 text-zinc-400 font-medium">Description</th>
                    <th className="text-left p-4 text-zinc-400 font-medium">Status</th>
                    <th className="text-left p-4 text-zinc-400 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.supportTickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-zinc-300">{ticket.name}</td>
                      <td className="p-4 font-mono text-blue-400">{ticket.email}</td>
                      <td className="p-4 text-zinc-300 max-w-xs truncate">{ticket.subject}</td>
                      <td className="p-4 text-zinc-400 max-w-md truncate">{ticket.description}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          ticket.status === 'open' ? 'bg-green-500/10 border border-green-500/20 text-green-400' :
                          ticket.status === 'in_progress' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
                          'bg-zinc-500/10 border border-zinc-500/20 text-zinc-400'
                        }`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="p-4 text-zinc-500">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {timeAgo(ticket.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {stats.supportTickets.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-zinc-500">No support tickets yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showResetModal && (
          <ResetUsageModal
            onClose={() => setShowResetModal(false)}
            onReset={async (userId) => {
              setResetting(true);
              try {
                const res = await fetch('/api/admin/reset-usage', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: userId || null }),
                });
                if (res.ok) {
                  setShowResetModal(false);
                  fetchStats();
                }
              } finally {
                setResetting(false);
              }
            }}
            users={stats?.recentSignups || []}
            loading={resetting}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGrantProModal && (
          <GrantProModal
            onClose={() => setShowGrantProModal(false)}
            users={stats?.recentSignups || []}
            onGrant={async (userId, plan) => {
              setGrantingPro(true);
              try {
                const res = await fetch('/api/admin/grant-pro', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId, plan }),
                });
                if (res.ok) {
                  setShowGrantProModal(false);
                  fetchStats();
                }
              } finally {
                setGrantingPro(false);
              }
            }}
            loading={grantingPro}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ResetUsageModal({ onClose, onReset, users, loading }: { onClose: () => void; onReset: (userId: string | null) => void; users: Profile[]; loading: boolean }) {
  const [selectedUser, setSelectedUser] = useState<string>('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
        className="w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-3xl p-8 relative shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-full bg-amber-500/10 border border-amber-500/20">
            <RotateCcw className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Reset Usage</h3>
            <p className="text-sm text-zinc-400">Reset monthly usage limits for users</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-300 mb-2">Select User (optional)</label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
          >
            <option value="">Reset all users</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email}
              </option>
            ))}
          </select>
          <p className="text-xs text-zinc-500 mt-2">
            {selectedUser ? 'Will reset usage for selected user only' : 'Will reset usage for all users'}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-full font-medium text-zinc-400 hover:text-white border border-white/10 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onReset(selectedUser || null)}
            disabled={loading}
            className="flex-1 py-3 rounded-full font-semibold bg-amber-500 text-black hover:bg-amber-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <RotateCcw className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Resetting...' : 'Reset Usage'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function GrantProModal({ onClose, users, onGrant }: { onClose: () => void; users: Profile[]; onGrant: (userId: string, plan: string) => void; loading: boolean }) {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');

  const plans = [
    { value: 'pro', label: 'Pro' },
    { value: 'design_partner', label: 'Design Partner' },
    { value: 'enterprise', label: 'Enterprise' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
        className="w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-3xl p-8 relative shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-full bg-green-500/10 border border-green-500/20">
            <Shield className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Grant Plan Access</h3>
            <p className="text-sm text-zinc-400">Manually grant access to a user</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-300 mb-2">Select User</label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-green-500/50 transition-colors"
          >
            <option value="">Select a user...</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-300 mb-2">Select Plan</label>
          <select
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-green-500/50 transition-colors"
          >
            {plans.map((plan) => (
              <option key={plan.value} value={plan.value}>
                {plan.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-full font-medium text-zinc-400 hover:text-white border border-white/10 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onGrant(selectedUser, selectedPlan)}
            disabled={!selectedUser}
            className="flex-1 py-3 rounded-full font-semibold bg-green-500 text-black hover:bg-green-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            Grant Access
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
