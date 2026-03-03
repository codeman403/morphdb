'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'morphdb-cookie-consent';

type ConsentStatus = 'pending' | 'accepted' | 'declined';

export default function CookieConsent() {
  const [status, setStatus] = useState<ConsentStatus>('pending');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (savedConsent === 'accepted' || savedConsent === 'declined') {
      setStatus(savedConsent as ConsentStatus);
    } else {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setStatus('accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setStatus('declined');
    setIsVisible(false);
  };

  // Don't render if user has already made a choice
  if (status !== 'pending') return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto bg-slate-900/95 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-4 md:p-6 shadow-2xl shadow-black/50">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              {/* Icon and Text */}
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-emerald-500/10 rounded-lg shrink-0">
                  <Cookie className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">We use cookies</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    We use essential cookies for authentication and security. By continuing to use MorphDB, you agree to our{' '}
                    <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300 underline">
                      Privacy Policy
                    </Link>.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={handleDecline}
                  className="flex-1 md:flex-none px-4 py-2 text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-600 rounded-lg transition-colors"
                >
                  Decline
                </button>
                <button
                  onClick={handleAccept}
                  className="flex-1 md:flex-none px-4 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
                >
                  Accept
                </button>
              </div>

              {/* Close button for mobile */}
              <button
                onClick={handleDecline}
                className="absolute top-3 right-3 md:hidden p-1 text-zinc-500 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
