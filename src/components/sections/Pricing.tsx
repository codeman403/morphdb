'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, X, Loader2, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'Try the AI engine on small migrations.',
    features: [
      '5 batches per month',
      'Up to 10 files per batch',
      '50 translations per month',
      'GPT-4o Mini only',
      'Community Discord support',
    ],
    cta: 'Get Started',
    ctaAction: 'beta',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$15',
    period: '/mo',
    description: 'For developers migrating real production schemas.',
    features: [
      '50 batches per month',
      'Up to 50 files per batch',
      '500 translations per month',
      'All AI models (GPT-4o Mini, Claude Haiku & Sonnet)',
      'File upload & ZIP download',
      'Priority email support',
    ],
    cta: 'Start Free Trial',
    ctaAction: 'trial',
    ctaSecondary: 'Upgrade to Pro',
    ctaSecondaryAction: 'checkout',
    highlighted: true,
  },
  {
    name: 'Design Partner',
    price: '$50',
    period: '/mo',
    description: 'For teams migrating entire data warehouses.',
    features: [
      'Unlimited batches & translations',
      'Unlimited files per batch',
      'All AI models + early access to new models',
      'Advanced dbt project generation (tests & docs)',
      'Dedicated Slack channel with founders',
      'Guaranteed 100% logic preservation',
    ],
    cta: 'Join Waitlist',
    ctaAction: 'waitlist',
    highlighted: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For strict security and custom deployment needs.',
    features: [
      'Everything in Design Partner',
      'VPC Peering & Single-Tenant deployment',
      'Custom AST rule generation',
      'SOC2 Type II compliance',
      'SLA & 24/7 Priority Support',
    ],
    cta: 'Contact Sales',
    ctaAction: 'waitlist',
    highlighted: false,
  }
];

// WaitlistModal component with form handling
function WaitlistModal({ onClose }: { onClose: () => void }) {
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
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 relative shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close waitlist modal"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {status === 'success' ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">You&apos;re on the list!</h3>
            <p className="text-slate-400">We&apos;ll reach out to you soon with early access details.</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-sm text-cyan-400 mb-4">
                <Sparkles className="w-4 h-4" />
                Limited spots available
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Join the Waitlist</h3>
              <p className="text-slate-400 text-sm">Get early access to MorphDB and be the first to migrate your legacy databases with AI.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-800/80 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Work Email <span className="text-red-400">*</span></label>
                <input
                  type="email"
                  placeholder="jane@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-800/80 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Company</label>
                <input
                  type="text"
                  placeholder="Acme Corp"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-800/80 transition-colors"
                />
              </div>

              {status === 'error' && (
                <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{message}</p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-4 rounded-full font-semibold bg-white text-black hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {status === 'loading' ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                ) : (
                  'Secure My Spot'
                )}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function Pricing() {
    // ... (logic remains same)
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
    const [trialSuccess, setTrialSuccess] = useState(false);
    const [hasUsedTrial, setHasUsedTrial] = useState(false);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getSession().then(({ data: { session } }: { data: { session: { user?: { email?: string } } | null } }) => {
        setIsAuthenticated(!!session?.user);
        if (session?.user) {
            fetch('/api/auth/has-used-trial').then(r => r.json()).then(d => {
            if (d.hasUsedTrial) setHasUsedTrial(true);
            });
        }
        });
    }, []);

    const handleCheckout = async (plan: string) => {
        // ... (implementation same)
        if (!isAuthenticated) {
            router.push('/login');
            return;
          }
          setCheckoutLoading(plan);
          try {
            if (plan === 'trial') {
              const res = await fetch('/api/trial', { method: 'POST' });
              const data = await res.json();
              if (res.ok) {
                setTrialSuccess(true);
                setTimeout(() => {
                  window.location.href = '/dashboard';
                }, 2000);
              } else {
                alert(data.error);
              }
            } else {
              const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan }),
              });
              const data = await res.json();
              if (data.url) {
                window.location.href = data.url;
              }
            }
          } catch {
            // silently fail - user stays on page
          } finally {
            setCheckoutLoading(null);
          }
    };

  return (
    <>
      {trialSuccess && (
        <div className="fixed top-24 right-6 z-50 px-6 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <span className="text-emerald-400 font-medium">3-Day Pro Trial activated! Redirecting...</span>
          </div>
        </div>
      )}
      <section id="pricing" className="relative py-24 overflow-visible">
        {/* No background - inherits from parent */}
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-bold text-white mb-6"
            >
              Simple, transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">pricing</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
            >
              Whether you&apos;re exploring the beta or migrating an entire enterprise data warehouse, we have a plan tailored for your team.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className={`relative flex flex-col p-8 rounded-3xl backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 ${
                  tier.highlighted 
                    ? 'bg-gradient-to-b from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 md:scale-105 z-10' 
                    : 'bg-slate-900/50 border border-slate-800'
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-sm font-semibold text-white flex items-center gap-1 shadow-lg shadow-emerald-500/25">
                    <Sparkles className="w-4 h-4" />
                    Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                  <p className="text-slate-400 text-sm h-10">{tier.description}</p>
                </div>

                <div className="mb-8 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{tier.price}</span>
                  {tier.period && <span className="text-slate-500">{tier.period}</span>}
                </div>

                <ul className="flex flex-col gap-4 mb-8 flex-grow">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-slate-300">
                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {tier.ctaSecondary ? (
                  <div className="flex flex-col gap-3 mt-auto">
                    {!hasUsedTrial ? (
                      <button 
                        onClick={() => {
                          if (tier.ctaAction === 'trial') handleCheckout('trial');
                        }}
                        disabled={checkoutLoading === 'trial'}
                        className="w-full py-3 rounded-full font-semibold bg-white text-black hover:bg-slate-200 transition-colors disabled:opacity-70"
                      >
                        {checkoutLoading === 'trial' ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" /> Starting...
                          </span>
                        ) : tier.cta}
                      </button>
                    ) : (
                      <div className="w-full py-3 text-center text-sm text-slate-500 bg-slate-800/50 rounded-full border border-slate-700">
                        Trial Used
                      </div>
                    )}
                    <button 
                      onClick={() => {
                        if (tier.ctaSecondaryAction === 'checkout') handleCheckout(tier.name.toLowerCase().replace(' ', '_'));
                      }}
                      disabled={checkoutLoading === tier.name.toLowerCase().replace(' ', '_')}
                      className="w-full py-3 rounded-full font-semibold bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 transition-colors disabled:opacity-70"
                    >
                      {checkoutLoading === tier.name.toLowerCase().replace(' ', '_') ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" /> Redirecting...
                        </span>
                      ) : tier.ctaSecondary}
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      if (tier.ctaAction === 'waitlist') setIsModalOpen(true);
                      else if (tier.ctaAction === 'beta') router.push(isAuthenticated ? '/dashboard/migrate' : '/login');
                      else if (tier.ctaAction === 'trial') handleCheckout('trial');
                      else if (tier.ctaAction === 'checkout') handleCheckout(tier.name.toLowerCase().replace(' ', '_'));
                    }}
                    disabled={checkoutLoading === tier.name.toLowerCase().replace(' ', '_')}
                    className={`w-full py-4 rounded-full font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${
                      tier.highlighted
                        ? 'bg-white text-black hover:bg-slate-200'
                        : 'bg-slate-800 text-white border border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {checkoutLoading === tier.name.toLowerCase().replace(' ', '_') ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Redirecting...
                      </span>
                    ) : tier.cta}
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {isModalOpen && <WaitlistModal onClose={() => setIsModalOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
