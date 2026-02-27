'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Database, ArrowLeft, Loader2, CheckCircle2, Headphones } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function SupportPage() {
  const supabase = createClient();
  const [form, setForm] = useState({ name: '', email: '', subject: '', description: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: { user?: { email?: string } } | null } }) => {
      if (session?.user) {
        fetch('/api/auth/profile').then(r => r.json()).then(d => {
          setForm(prev => ({
            ...prev,
            name: d.firstName || '',
            email: session?.user?.email || ''
          }));
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setForm({ name: '', email: '', subject: '', description: '' });
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.6 }}
        className="w-full max-w-lg relative z-10"
      >
        <Link href="/" className="flex items-center gap-2 text-white mb-8 justify-center">
          <Database className="w-7 h-7 text-blue-500" />
          <span className="font-bold text-2xl tracking-tight">MorphDB</span>
        </Link>

        {status === 'success' ? (
          <div className="text-center py-12 bg-white/5 border border-white/10 rounded-3xl px-8">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Request Submitted!</h2>
            <p className="text-zinc-400 mb-6">We&apos;ve received your support request and will get back to you soon.</p>
            <Link href="/" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">← Back to Home</Link>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400 mb-6">
              <Headphones className="w-4 h-4" />
              Support
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">How can we help?</h1>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
              Submit a support request and our team will get back to you as soon as possible.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Name</label>
                <input 
                  type="text" 
                  placeholder="Jane Smith" 
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email <span className="text-red-400">*</span></label>
                <input 
                  type="email" 
                  placeholder="jane@company.com" 
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Subject <span className="text-red-400">*</span></label>
                <input 
                  type="text" 
                  placeholder="Brief description of your issue" 
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description <span className="text-red-400">*</span></label>
                <textarea 
                  placeholder="Please describe your issue in detail..." 
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                />
              </div>

              {status === 'error' && (
                <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{message}</p>
              )}

              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="w-full py-4 rounded-full font-semibold bg-white text-black hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
              >
                {status === 'loading' ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : 'Submit Request →'}
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}
