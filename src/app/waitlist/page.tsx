'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Database, Sparkles, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function WaitlistPage() {
  const [form, setForm] = useState({ name: '', email: '', company: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tier: 'design_partner' }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center px-6 py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <Link href="/" className="flex items-center gap-2 text-white mb-8 justify-center">
          <Database className="w-7 h-7 text-blue-500" />
          <span className="font-bold text-2xl tracking-tight">MorphDB</span>
        </Link>

        {status === 'success' ? (
          <div className="text-center py-12 bg-white/5 border border-white/10 rounded-3xl px-8">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">You&apos;re on the list!</h2>
            <p className="text-zinc-400 mb-6">We&apos;ll reach out with early access details very soon.</p>
            <Link href="/" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">← Back to Home</Link>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400 mb-6">
              <Sparkles className="w-4 h-4" />
              Limited spots available
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Get Early Access</h1>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
              Join forward-thinking data engineering teams already on our waitlist for MorphDB&apos;s Design Partner program.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Full Name</label>
                <input type="text" placeholder="Jane Smith" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Work Email <span className="text-red-400">*</span></label>
                <input type="email" placeholder="jane@company.com" value={form.email} required
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Company</label>
                <input type="text" placeholder="Acme Corp" value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
              {status === 'error' && (
                <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{message}</p>
              )}
              <button type="submit" disabled={status === 'loading'}
                className="w-full py-4 rounded-full font-semibold bg-white text-black hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
              >
                {status === 'loading' ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : 'Secure My Spot →'}
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}
