'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { PageBackground } from '@/components/ui/backgrounds/PageBackground';

interface SubscriptionData {
  tier: string;
  tierLabel: string;
  plan?: string;
  status?: string;
  currentPeriodEnd?: string;
  firstName?: string | null;
  limits?: {
    batchesPerMonth: number | string;
    filesPerBatch: number | string;
    translationsPerMonth: number | string;
    allowedModels: string[];
  };
}

interface CancellationState {
  isOpen: boolean;
  reason: string;
  feedback: string;
  isLoading: boolean;
  error: string;
}

export default function SubscriptionSettingsPage() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellation, setCancellation] = useState<CancellationState>({
    isOpen: false,
    reason: '',
    feedback: '',
    isLoading: false,
    error: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const res = await fetch('/api/auth/profile');
        const data = await res.json();
        setSubscription(data);
      } catch (error) {
        console.error('Failed to fetch subscription:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const handleCancelClick = () => {
    setCancellation({ ...cancellation, isOpen: true, error: '' });
  };

  const handleCloseModal = () => {
    setCancellation({
      isOpen: false,
      reason: '',
      feedback: '',
      isLoading: false,
      error: '',
    });
    setSuccessMessage('');
    setCheckoutError('');
  };

  const handleCancelSubscription = async () => {
    if (!cancellation.reason) {
      setCancellation({
        ...cancellation,
        error: 'Please select a cancellation reason',
      });
      return;
    }

    setCancellation({ ...cancellation, isLoading: true, error: '' });

    try {
      const res = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: cancellation.reason,
          feedback: cancellation.feedback,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(
          `Subscription cancelled successfully. Your access will end on ${data.effectiveDate}.`
        );
        setCancellation({
          isOpen: false,
          reason: '',
          feedback: '',
          isLoading: false,
          error: '',
        });
        // Refresh subscription data
        setTimeout(() => {
          router.refresh();
        }, 2000);
      } else {
        setCancellation({
          ...cancellation,
          error: data.error || 'Failed to cancel subscription',
          isLoading: false,
        });
      }
    } catch (error) {
      setCancellation({
        ...cancellation,
        error: 'Network error. Please try again.',
        isLoading: false,
      });
    }
  };

  const isPaid = subscription?.tier && subscription.tier !== 'free';

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
          className="w-full max-w-2xl relative z-10"
        >
          {/* Back Button */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors mb-8 text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="bg-slate-950/80 backdrop-blur-md border border-emerald-500/20 shadow-lg shadow-emerald-500/5 rounded-3xl p-8">
            <h1 className="text-3xl font-bold text-white mb-2">Subscription Settings</h1>
            <p className="text-zinc-400 text-sm mb-8">
              Manage your MorphDB subscription and billing
            </p>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              </div>
            ) : (
              <>
                {/* Success Message */}
                {successMessage && (
                  <div className="mb-8 flex items-start gap-3 bg-emerald-400/10 border border-emerald-400/30 rounded-xl p-4">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <p className="text-emerald-400 text-sm">{successMessage}</p>
                  </div>
                )}

                {/* Subscription Card */}
                <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-6 mb-8">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Current Plan */}
                    <div>
                      <p className="text-zinc-400 text-xs uppercase tracking-wider mb-2">
                        Current Plan
                      </p>
                      <p className="text-white text-2xl font-bold">{subscription?.tierLabel}</p>
                      {isPaid && (
                        <p className="text-emerald-400 text-sm mt-2 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Active
                        </p>
                      )}
                      {!isPaid && (
                        <p className="text-zinc-400 text-sm mt-2">No active subscription</p>
                      )}
                    </div>

                    {/* Billing Status */}
                    <div>
                      <p className="text-zinc-400 text-xs uppercase tracking-wider mb-2">
                        Status
                      </p>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            isPaid ? 'bg-emerald-500' : 'bg-zinc-500'
                          }`}
                        />
                        <p className="text-white font-medium">
                          {isPaid ? 'Paid Subscriber' : 'Free Plan'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Usage Info */}
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-zinc-400 text-xs uppercase tracking-wider mb-3">
                      Your Limits
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-white text-sm font-medium">
                          {subscription?.limits?.batchesPerMonth}
                        </p>
                        <p className="text-zinc-400 text-xs">Batches/Month</p>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">
                          {subscription?.limits?.filesPerBatch}
                        </p>
                        <p className="text-zinc-400 text-xs">Files/Batch</p>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">
                          {subscription?.limits?.translationsPerMonth}
                        </p>
                        <p className="text-zinc-400 text-xs">Translations/Month</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  {checkoutError && (
                    <div className="mb-4 flex items-start gap-3 bg-red-400/10 border border-red-400/30 rounded-xl p-4">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-red-400 text-sm">{checkoutError}</p>
                    </div>
                  )}
                  {isPaid && (
                     <>
                       <button
                         onClick={handleCancelClick}
                         className="w-full px-4 py-3 rounded-xl border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
                       >
                         Cancel Subscription
                       </button>
                       <p className="text-zinc-500 text-xs text-center">
                         Your access will continue until the end of your billing period
                       </p>
                     </>
                   )}

                   {!isPaid && (
                     <Link
                       href="/#pricing"
                       className="block w-full px-4 py-3 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors text-sm font-medium text-center"
                     >
                       Upgrade to Pro
                     </Link>
                   )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </PageBackground>

      {/* Cancellation Modal */}
      {cancellation.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-950 border border-emerald-500/20 rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-amber-500" />
              <h2 className="text-xl font-bold text-white">Cancel Subscription?</h2>
            </div>

            <p className="text-zinc-400 text-sm mb-6">
              We're sorry to see you go! Your subscription will remain active until the end of your
              current billing period. Tell us why you're cancelling so we can improve.
            </p>

            {/* Cancellation Reason */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Reason for cancellation *
              </label>
              <select
                value={cancellation.reason}
                onChange={(e) =>
                  setCancellation({ ...cancellation, reason: e.target.value, error: '' })
                }
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-emerald-500/20 text-white focus:outline-none focus:border-emerald-500/50 transition-colors text-sm"
              >
                <option value="">Select a reason...</option>
                <option value="too_expensive">Too expensive</option>
                <option value="insufficient_features">Insufficient features</option>
                <option value="poor_performance">Poor performance</option>
                <option value="found_alternative">Found alternative</option>
                <option value="no_longer_needed">No longer needed</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Feedback */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Additional feedback (optional)
              </label>
              <textarea
                value={cancellation.feedback}
                onChange={(e) => setCancellation({ ...cancellation, feedback: e.target.value })}
                placeholder="Help us improve by sharing your thoughts..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-emerald-500/20 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors text-sm resize-none h-24"
              />
            </div>

            {/* Error Message */}
            {cancellation.error && (
              <div className="mb-6 text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 text-sm">
                {cancellation.error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCloseModal}
                disabled={cancellation.isLoading}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-emerald-500/20 text-white hover:bg-white/10 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={cancellation.isLoading}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {cancellation.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel Subscription'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}
