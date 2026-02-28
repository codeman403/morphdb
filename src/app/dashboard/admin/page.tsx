'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, ArrowLeft, Users, LogIn, CreditCard, Clock,
  Globe, Monitor, Mail, Building2, Shield, RefreshCw, Headphones, RotateCcw, X,
} from 'lucide-react';
import { PageBackground } from '@/components/ui/backgrounds/PageBackground';
import { ToastContainer, useToast } from '@/components/ui/Toast';

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

interface SubscriptionRecord {
  id: string;
  userId: string;
  plan: string;
  status: string;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
  profile: Profile;
}

interface Stats {
  waitlist: { count: number; entries: WaitlistEntry[]; total: number; offset: number; limit: number; hasMore: boolean };
  logins: { entries: LoginLog[]; total: number; offset: number; limit: number; hasMore: boolean };
  subscriptions: { entries: SubscriptionRecord[]; total: number; offset: number; limit: number; hasMore: boolean };
  recentSignups: { entries: Profile[]; total: number; offset: number; limit: number; hasMore: boolean };
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
   const { toasts, removeToast, success, error: errorToast } = useToast();
   const [stats, setStats] = useState<Stats | null>(null);
   const [error, setError] = useState<string | null>(null);
   const [loading, setLoading] = useState(true);
   const [activeTab, setActiveTab] = useState<'waitlist' | 'logins' | 'signups' | 'subscriptions' | 'support'>('waitlist');
     const [resetting, setResetting] = useState(false);
     const [showResetModal, setShowResetModal] = useState(false);
     const [showGrantProModal, setShowGrantProModal] = useState(false);
     const [grantingPro, setGrantingPro] = useState(false);
     const [sendingWelcomeEmailFor, setSendingWelcomeEmailFor] = useState<string | null>(null);
     const [closingTicket, setClosingTicket] = useState(false);
     const [selectedTicketForClose, setSelectedTicketForClose] = useState<string | null>(null);
     const [sendingTrialReminderFor, setSendingTrialReminderFor] = useState<string | null>(null);

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

   const sendWelcomeEmail = async (userId: string) => {
     setSendingWelcomeEmailFor(userId);
     try {
       const res = await fetch('/api/admin/send-welcome-email', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ userId }),
       });
       const data = await res.json();
       if (res.ok) {
         success(`Welcome email sent to ${data.email}`);
       } else {
         errorToast(`Error: ${data.error || 'Failed to send email'}`);
       }
     } catch (e) {
       errorToast(`Error: ${e instanceof Error ? e.message : 'Failed to send email'}`);
     } finally {
       setSendingWelcomeEmailFor(null);
     }
   };

  const closeTicket = async (ticketId: string) => {
    setClosingTicket(true);
    try {
      const res = await fetch('/api/admin/close-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, sendNotification: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedTicketForClose(null);
        success('Ticket closed successfully');
        fetchStats();
      } else {
        errorToast(`Error: ${data.error || 'Failed to close ticket'}`);
      }
    } catch (e) {
      errorToast(`Error: ${e instanceof Error ? e.message : 'Failed to close ticket'}`);
    } finally {
      setClosingTicket(false);
    }
  };

   const sendTrialReminderEmail = async (userId: string) => {
     setSendingTrialReminderFor(userId);
     try {
       const res = await fetch('/api/admin/send-trial-reminder', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ userId }),
       });
       const data = await res.json();
       if (res.ok) {
         success('Trial reminder email sent successfully');
       } else {
         errorToast(`Error: ${data.error || 'Failed to send email'}`);
       }
     } catch (e) {
       errorToast(`Error: ${e instanceof Error ? e.message : 'Failed to send email'}`);
     } finally {
       setSendingTrialReminderFor(null);
     }
   };

   const sendTrialReminderEmails = async () => {
     setSendingTrialReminderFor('batch');
     try {
       const res = await fetch('/api/admin/send-trial-reminder', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
       });
       const data = await res.json();
       if (res.ok) {
         success(`Sent ${data.stats.successCount} trial reminder emails. Failed: ${data.stats.failureCount}`);
       } else {
         errorToast(`Error: ${data.error || 'Failed to send reminders'}`);
       }
     } catch (e) {
       errorToast(`Error: ${e instanceof Error ? e.message : 'Failed to send reminders'}`);
     } finally {
       setSendingTrialReminderFor(null);
     }
   };

 useEffect(() => { fetchStats(); }, []);

  if (loading) {
    return (
      <PageBackground variant="intense" className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-zinc-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Loading admin dashboard...
        </div>
      </PageBackground>
    );
  }

  if (error) {
    return (
      <PageBackground variant="intense" className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-zinc-400 mb-6">{error}</p>
          <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300 underline">
            Back to Dashboard
          </Link>
        </div>
      </PageBackground>
    );
  }

  if (!stats) return null;

  const statCards = [
    { label: 'Waitlist Signups', value: stats.waitlist.count, icon: Users, color: 'blue' },
    { label: 'Login Events', value: stats.logins.total, icon: LogIn, color: 'green' },
    { label: 'Total Users', value: stats.recentSignups.total, icon: Mail, color: 'purple' },
    { label: 'Paid Subscriptions', value: stats.subscriptions.total, icon: CreditCard, color: 'amber' },
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
    { key: 'logins' as const, label: 'Login Logs', icon: LogIn, count: stats.logins.total },
    { key: 'signups' as const, label: 'Users', icon: Mail, count: stats.recentSignups.total },
    { key: 'subscriptions' as const, label: 'Subscriptions', icon: CreditCard, count: stats.subscriptions.total },
    { key: 'support' as const, label: 'Support Tickets', icon: Headphones, count: stats.supportTickets.length },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-emerald-500/20 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <Database className="w-6 h-6 text-emerald-500" />
              <span className="font-bold text-lg tracking-tight">MorphDB</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-medium">Admin</span>
            </div>
          </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGrantProModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-green-400 hover:text-green-300 border border-green-500/20 rounded-full hover:bg-green-500/10 transition-colors"
              >
                Update Plan
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
                className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white border border-emerald-500/20 rounded-full hover:bg-slate-900/50 backdrop-blur-md transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>
        </div>
      </nav>

      <PageBackground variant="intense" className="flex-grow pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {statCards.map((card) => (
            <div key={card.label} className="bg-slate-900/50 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-5">
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
                  : 'text-zinc-400 border-emerald-500/20 hover:bg-slate-900/50 backdrop-blur-md'
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

        <div className="bg-slate-900/50 backdrop-blur-md border border-emerald-500/20 rounded-2xl overflow-hidden">
          {activeTab === 'waitlist' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-emerald-500/20">
                    <th className="text-left p-4 text-zinc-400 font-medium">Email</th>
                    <th className="text-left p-4 text-zinc-400 font-medium">Name</th>
                    <th className="text-left p-4 text-zinc-400 font-medium">Company</th>
                    <th className="text-left p-4 text-zinc-400 font-medium">Tier</th>
                    <th className="text-left p-4 text-zinc-400 font-medium">Signed Up</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.waitlist.entries.map((entry) => (
                    <tr key={entry.id} className="border-b border-white/5 hover:bg-slate-900/50 backdrop-blur-md transition-colors">
                      <td className="p-4 font-mono text-blue-400">{entry.email}</td>
                      <td className="p-4 text-zinc-300">{entry.name ?? '—'}</td>
                      <td className="p-4 text-zinc-300">
                        <span className="flex items-center gap-1.5">
                          {entry.company && <Building2 className="w-3.5 h-3.5 text-zinc-500" />}
                          {entry.company ?? '—'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
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
                  <tr className="border-b border-emerald-500/20">
                    <th className="text-left p-4 text-zinc-400 font-medium">Email</th>
                    <th className="text-left p-4 text-zinc-400 font-medium">IP</th>
                    <th className="text-left p-4 text-zinc-400 font-medium">Country</th>
                    <th className="text-left p-4 text-zinc-400 font-medium">Browser</th>
                    <th className="text-left p-4 text-zinc-400 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.logins.entries.map((log) => (
                    <tr key={log.id} className="border-b border-white/5 hover:bg-slate-900/50 backdrop-blur-md transition-colors">
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
                  {stats.logins.entries.length === 0 && (
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
                   <tr className="border-b border-emerald-500/20">
                     <th className="text-left p-4 text-zinc-400 font-medium">Email</th>
                     <th className="text-left p-4 text-zinc-400 font-medium">Name</th>
                     <th className="text-left p-4 text-zinc-400 font-medium">Company</th>
                     <th className="text-left p-4 text-zinc-400 font-medium">Joined</th>
                     <th className="text-left p-4 text-zinc-400 font-medium">Actions</th>
                   </tr>
                 </thead>
                 <tbody>
                   {stats.recentSignups.entries.map((profile) => (
                     <tr key={profile.id} className="border-b border-white/5 hover:bg-slate-900/50 backdrop-blur-md transition-colors">
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
                        <td className="p-4">
                          <button
                            onClick={() => sendWelcomeEmail(profile.id)}
                            disabled={sendingWelcomeEmailFor === profile.id}
                            className="flex items-center gap-1.5 px-2 py-1 text-xs text-blue-400 hover:text-blue-300 border border-blue-500/20 rounded hover:bg-blue-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            {sendingWelcomeEmailFor === profile.id ? 'Sending...' : 'Welcome Email'}
                          </button>
                        </td>
                     </tr>
                   ))}
                   {stats.recentSignups.entries.length === 0 && (
                     <tr><td colSpan={5} className="p-8 text-center text-zinc-500">No users yet</td></tr>
                   )}
                 </tbody>
               </table>
             </div>
            )}

          {activeTab === 'subscriptions' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                 <thead>
                   <tr className="border-b border-emerald-500/20">
                     <th className="text-left p-4 text-zinc-400 font-medium">Email</th>
                     <th className="text-left p-4 text-zinc-400 font-medium">Name</th>
                     <th className="text-left p-4 text-zinc-400 font-medium">Plan</th>
                     <th className="text-left p-4 text-zinc-400 font-medium">Status</th>
                     <th className="text-left p-4 text-zinc-400 font-medium">Trial Ends</th>
                     <th className="text-left p-4 text-zinc-400 font-medium">Period End</th>
                     <th className="text-left p-4 text-zinc-400 font-medium">Subscribed</th>
                     <th className="text-left p-4 text-zinc-400 font-medium">Actions</th>
                   </tr>
                 </thead>
                <tbody>
                  {stats.subscriptions.entries.map((sub) => (
                    <tr key={sub.id} className="border-b border-white/5 hover:bg-slate-900/50 backdrop-blur-md transition-colors">
                      <td className="p-4 font-mono text-amber-400">{sub.profile.email}</td>
                      <td className="p-4 text-zinc-300">{sub.profile.name ?? '—'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          sub.plan === 'pro' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                          sub.plan === 'design_partner' ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400' :
                          sub.plan === 'enterprise' ? 'bg-red-500/10 border border-red-500/20 text-red-400' :
                          'bg-zinc-500/10 border border-zinc-500/20 text-zinc-400'
                        }`}>
                          {sub.plan.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          sub.status === 'active' ? 'bg-green-500/10 border border-green-500/20 text-green-400' :
                          sub.status === 'trialing' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
                          'bg-zinc-500/10 border border-zinc-500/20 text-zinc-400'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="p-4 text-zinc-400 text-xs">
                        {sub.trialEndsAt ? new Date(sub.trialEndsAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="p-4 text-zinc-400 text-xs">
                        {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : '—'}
                      </td>
                       <td className="p-4 text-zinc-500">
                         <span className="flex items-center gap-1.5">
                           <Clock className="w-3.5 h-3.5" />
                           {timeAgo(sub.createdAt)}
                         </span>
                       </td>
                       <td className="p-4">
                         <button
                           onClick={() => sendTrialReminderEmail(sub.profile.id)}
                           disabled={sendingTrialReminderFor === sub.profile.id}
                           className="flex items-center gap-1.5 px-2 py-1 text-xs text-blue-400 hover:text-blue-300 border border-blue-500/20 rounded hover:bg-blue-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                           <Mail className="w-3.5 h-3.5" />
                           {sendingTrialReminderFor === sub.profile.id ? 'Sending...' : 'Trial Reminder'}
                         </button>
                       </td>
                     </tr>
                  ))}
                   {stats.subscriptions.entries.length === 0 && (
                     <tr><td colSpan={8} className="p-8 text-center text-zinc-500">No paid subscriptions yet</td></tr>
                   )}
                </tbody>
              </table>
            </div>
          )}

           {activeTab === 'support' && (
             <div className="overflow-x-auto">
               <table className="w-full text-sm">
                 <thead>
                   <tr className="border-b border-emerald-500/20">
                     <th className="text-left p-4 text-zinc-400 font-medium">Name</th>
                     <th className="text-left p-4 text-zinc-400 font-medium">Email</th>
                     <th className="text-left p-4 text-zinc-400 font-medium">Subject</th>
                     <th className="text-left p-4 text-zinc-400 font-medium">Description</th>
                     <th className="text-left p-4 text-zinc-400 font-medium">Status</th>
                     <th className="text-left p-4 text-zinc-400 font-medium">Date</th>
                     <th className="text-left p-4 text-zinc-400 font-medium">Actions</th>
                   </tr>
                 </thead>
                 <tbody>
                   {stats.supportTickets.map((ticket) => (
                     <tr key={ticket.id} className="border-b border-white/5 hover:bg-slate-900/50 backdrop-blur-md transition-colors">
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
                       <td className="p-4">
                         {ticket.status !== 'closed' && (
                            <button
                              onClick={() => {
                                if (confirm('Close this ticket and send confirmation email?')) {
                                  setSelectedTicketForClose(ticket.id);
                                  closeTicket(ticket.id);
                                }
                              }}
                              disabled={selectedTicketForClose === ticket.id}
                              className="flex items-center gap-1.5 px-2 py-1 text-xs text-amber-400 hover:text-amber-300 border border-amber-500/20 rounded hover:bg-amber-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <X className="w-3.5 h-3.5" />
                              {selectedTicketForClose === ticket.id ? 'Closing...' : 'Close'}
                            </button>
                         )}
                       </td>
                     </tr>
                   ))}
                   {stats.supportTickets.length === 0 && (
                     <tr><td colSpan={7} className="p-8 text-center text-zinc-500">No support tickets yet</td></tr>
                   )}
                 </tbody>
               </table>
             </div>
           )}
        </div>
        </div>
      </PageBackground>

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
             users={stats?.recentSignups?.entries || []}
             loading={resetting}
           />
         )}
       </AnimatePresence>

       <AnimatePresence>
         {showGrantProModal && (
           <GrantProModal
             onClose={() => setShowGrantProModal(false)}
             users={stats?.recentSignups?.entries || []}
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

     <ToastContainer toasts={toasts} onRemove={removeToast} />
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
        className="w-full max-w-md bg-[#0f0f0f] border border-emerald-500/20 rounded-3xl p-8 relative shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-500 hover:text-white hover:bg-slate-900/50 backdrop-blur-md transition-colors"
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
            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 backdrop-blur-md border border-emerald-500/20 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
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
            className="flex-1 py-3 rounded-full font-medium text-zinc-400 hover:text-white border border-emerald-500/20 hover:bg-slate-900/50 backdrop-blur-md transition-colors"
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
    { value: 'free', label: 'Free' },
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
        className="w-full max-w-md bg-[#0f0f0f] border border-emerald-500/20 rounded-3xl p-8 relative shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-500 hover:text-white hover:bg-slate-900/50 backdrop-blur-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-full bg-green-500/10 border border-green-500/20">
            <Shield className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Update User Plan</h3>
            <p className="text-sm text-zinc-400">Grant or revoke plan access for a user</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-300 mb-2">Select User</label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 backdrop-blur-md border border-emerald-500/20 text-white focus:outline-none focus:border-green-500/50 transition-colors"
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
            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 backdrop-blur-md border border-emerald-500/20 text-white focus:outline-none focus:border-green-500/50 transition-colors"
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
            className="flex-1 py-3 rounded-full font-medium text-zinc-400 hover:text-white border border-emerald-500/20 hover:bg-slate-900/50 backdrop-blur-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onGrant(selectedUser, selectedPlan)}
            disabled={!selectedUser}
            className="flex-1 py-3 rounded-full font-semibold bg-green-500 text-black hover:bg-green-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            Update Plan
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
