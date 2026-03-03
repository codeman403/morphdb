'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { PageBackground } from '@/components/ui/backgrounds/PageBackground';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [form, setForm] = useState({ email: '', password: '', name: '', company: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    const endpoint = tab === 'signup' ? '/api/auth/signup' : '/api/auth/signin';
    const payload = tab === 'signup'
      ? { email: form.email, password: form.password, name: form.name, company: form.company }
      : { email: form.email, password: form.password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        if (tab === 'signup') {
          setMessage('Account created! Check your email to verify before signing in.');
          setStatus('idle');
        } else {
          router.push('/dashboard');
          router.refresh();
        }
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
    <div id="main-content" className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />

      <PageBackground variant="intense" className="flex-grow flex items-center justify-center px-6 py-24 pt-32 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.6 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-slate-950/80 backdrop-blur-md border border-emerald-500/20 shadow-lg shadow-emerald-500/5 rounded-3xl p-8">
            <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-8">
              {(['signin', 'signup'] as const).map((t) => (
                <button key={t} onClick={() => { setTab(t); setMessage(''); setStatus('idle'); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${tab === t ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-zinc-400 hover:text-white'}`}
                >
                  {t === 'signin' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">
              {tab === 'signin' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-zinc-400 text-sm mb-8">
              {tab === 'signin' ? 'Sign in to your MorphDB dashboard.' : 'Start your 14-day free trial. No credit card required.'}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {tab === 'signup' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Full Name</label>
                    <input type="text" placeholder="Jane Smith" value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-emerald-500/20 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Company</label>
                    <input type="text" placeholder="Acme Corp" value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-emerald-500/20 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Work Email</label>
                <input type="email" placeholder="jane@company.com" value={form.email} required
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-emerald-500/20 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-zinc-300">Password</label>
                  {tab === 'signin' && <Link href="/forgot-password" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">Forgot password?</Link>}
                </div>
                <input type="password" placeholder="••••••••" value={form.password} required minLength={8}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-emerald-500/20 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              {message && (
                <p className={`text-sm rounded-xl px-4 py-3 ${status === 'error' ? 'text-red-400 bg-red-400/10 border border-red-400/20' : 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20'}`}>
                  {message}
                </p>
              )}

              <button type="submit" disabled={status === 'loading'}
                className="w-full py-4 rounded-full font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 mt-2 shadow-lg shadow-emerald-500/25"
              >
                {status === 'loading' ? <><Loader2 className="w-5 h-5 animate-spin" /> Loading...</> : tab === 'signin' ? 'Sign In →' : 'Create Account →'}
              </button>
            </form>

            <p className="text-center text-zinc-500 text-xs mt-6">
              By continuing, you agree to our{' '}
              <Link href="#" className="text-zinc-400 hover:text-emerald-400 transition-colors">Terms of Service</Link>
            </p>
          </div>
        </motion.div>
      </PageBackground>

      <Footer />
    </div>
  );
}
