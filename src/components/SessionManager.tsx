'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, LogOut } from 'lucide-react';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
const WARNING_BEFORE = 2 * 60 * 1000;
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];

// Try to create client once at module level
let supabase: ReturnType<typeof createClient> | null = null;
try {
  supabase = createClient();
} catch {
  // Supabase not configured
}

export default function SessionManager() {
  const router = useRouter();
  const pathname = usePathname();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const warningRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const countdownRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const handleLogout = useCallback(async () => {
    setShowWarning(false);
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/login');
  }, [router]);

  const setupTimers = useCallback(() => {
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    // Set warning timeout
    warningRef.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(Math.floor(WARNING_BEFORE / 1000));
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, INACTIVITY_TIMEOUT - WARNING_BEFORE);

    // Set logout timeout
    timeoutRef.current = setTimeout(handleLogout, INACTIVITY_TIMEOUT);
  }, [handleLogout]);

  const resetTimers = useCallback(() => {
    setShowWarning(false);
    setupTimers();
  }, [setupTimers]);

  const stayLoggedIn = useCallback(() => {
    setShowWarning(false);
    if (countdownRef.current) clearInterval(countdownRef.current);
    resetTimers();
  }, [resetTimers]);

  useEffect(() => {
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      setIsAuthenticated(!!session?.user);
    });

    supabase.auth.getSession().then(({ data: { session } }: { data: { session: { user?: { email?: string } } | null } }) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    resetTimers();

    const handleActivity = () => {
      if (!showWarning) resetTimers();
    };

    ACTIVITY_EVENTS.forEach(event =>
      window.addEventListener(event, handleActivity, { passive: true })
    );

    return () => {
      ACTIVITY_EVENTS.forEach(event =>
        window.removeEventListener(event, handleActivity)
      );
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isAuthenticated, resetTimers, showWarning]);

  useEffect(() => {
    if (isAuthenticated && !showWarning) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      resetTimers();
    }
  }, [pathname, isAuthenticated, showWarning, resetTimers]);

  if (!isAuthenticated) return null;

  return (
    <AnimatePresence>
      {showWarning && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md"
        >
          <div className="bg-[#1a1a1a] border border-amber-500/30 rounded-2xl p-5 shadow-2xl shadow-amber-500/10">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white mb-1">Session expiring soon</p>
                <p className="text-xs text-zinc-400">
                  You&apos;ll be logged out in <span className="text-amber-400 font-mono font-bold">{Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</span> due to inactivity.
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={stayLoggedIn}
                className="flex-1 px-4 py-2 text-sm font-semibold bg-white text-black rounded-xl hover:bg-zinc-200 transition-colors"
              >
                Stay Logged In
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm text-zinc-400 border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Log Out
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
