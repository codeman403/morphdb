'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Eye, EyeOff } from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { PageBackground } from '@/components/ui/backgrounds/PageBackground';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [message, setMessage] = useState('');
  const [tokenValid, setTokenValid] = useState(true);

  // Check if we have the reset token from Supabase
  useEffect(() => {
    const token = searchParams.get('code');
    if (!token) {
      setTokenValid(false);
      setMessage('Invalid or missing reset link. Please request a new password reset.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setStatus('error');
      setMessage('Password must be at least 8 characters long.');
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          code: searchParams.get('code'),
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to reset password. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
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
            <h1 className="text-2xl font-bold text-white mb-2">Set a new password</h1>
            <p className="text-zinc-400 text-sm mb-8">
              Enter a new password to complete the password reset process.
            </p>

            {!tokenValid ? (
              <div className="text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 text-sm">
                {message}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={status === 'success'}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-emerald-500/20 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">
                    Must be at least 8 characters with uppercase, lowercase, number, and special character
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={status === 'success'}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-emerald-500/20 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
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
                      <Loader2 className="w-5 h-5 animate-spin" /> Resetting...
                    </>
                  ) : status === 'success' ? (
                    'Password Reset'
                  ) : (
                    'Reset Password →'
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </PageBackground>

      <Footer />
    </div>
  );
}
