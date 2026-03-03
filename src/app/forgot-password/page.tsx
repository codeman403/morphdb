'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft } from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { PageBackground } from '@/components/ui/backgrounds/PageBackground';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage('Password reset link sent! Check your email for instructions.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to send reset link. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div id="main-content" className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />

      <PageBackground
        variant="intense"
        className="flex-grow flex items-center justify-center px-6 py-24 pt-32 relative overflow-hidden"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.6 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-slate-950/80 backdrop-blur-md border border-emerald-500/20 shadow-lg shadow-emerald-500/5 rounded-3xl p-8">
            <h1 className="text-2xl font-bold text-white mb-2">Reset your password</h1>
            <p className="text-zinc-400 text-sm mb-8">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Work Email
                </label>
                <input
                  type="email"
                  placeholder="jane@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={status === 'success'}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-emerald-500/20 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {message && (
                <p
                  className={`text-sm rounded-xl px-4 py-3 ${
                    status === 'error'
                      ? 'text-red-400 bg-red-400/10 border border-red-400/20'
                      : status === 'success'
                        ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20'
                        : 'text-blue-400 bg-blue-400/10 border border-blue-400/20'
                  }`}
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className="w-full py-4 rounded-full font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 mt-2 shadow-lg shadow-emerald-500/25"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Sending...
                  </>
                ) : status === 'success' ? (
                  'Link Sent'
                ) : (
                  'Send Reset Link →'
                )}
              </button>
            </form>

            <Link
              href="/login"
              className="mt-6 flex items-center justify-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
          </div>
        </motion.div>
      </PageBackground>

      <Footer />
    </div>
  );
}
