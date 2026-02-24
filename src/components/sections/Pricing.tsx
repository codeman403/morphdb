'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, X, Loader2, CheckCircle2 } from 'lucide-react';

const tiers = [
  {
    name: 'Developer Beta',
    price: 'Free',
    description: 'Perfect for testing the AI engine on small schemas.',
    features: [
      'Up to 50 tables/views',
      'Standard SQL dialect translation',
      'Basic dbt model generation',
      'Community Discord support',
    ],
    cta: 'Start Building',
    ctaAction: 'beta',
    highlighted: false,
  },
  {
    name: 'Design Partner',
    price: '$499',
    period: '/mo',
    description: 'For teams ready to migrate massive production workloads.',
    features: [
      'Unlimited tables & stored procedures',
      'Guaranteed 100% logic preservation',
      'Advanced dbt project generation (tests & docs)',
      'Dedicated Slack channel with founders',
    ],
    cta: 'Join the Waitlist',
    ctaAction: 'waitlist',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For strict security and custom deployment requirements.',
    features: [
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
        className="w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-3xl p-8 relative shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {status === 'success' ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">You&apos;re on the list!</h3>
            <p className="text-zinc-400">We&apos;ll reach out to you soon with early access details.</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400 mb-4">
                <Sparkles className="w-4 h-4" />
                Limited spots available
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Join the Waitlist</h3>
              <p className="text-zinc-400 text-sm">Get early access to MorphDB and be the first to migrate your legacy databases with AI.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Work Email <span className="text-red-400">*</span></label>
                <input
                  type="email"
                  placeholder="jane@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Company</label>
                <input
                  type="text"
                  placeholder="Acme Corp"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-colors"
                />
              </div>

              {status === 'error' && (
                <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{message}</p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-4 rounded-full font-semibold bg-white text-black hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
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
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section id="pricing" className="py-24 relative overflow-hidden bg-[#050505]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-bold text-white mb-6"
            >
              Simple, transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">pricing</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
            >
              Whether you&apos;re exploring the beta or migrating an entire enterprise data warehouse, we have a plan tailored for your team.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className={`relative flex flex-col p-8 rounded-3xl backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 ${
                  tier.highlighted 
                    ? 'bg-gradient-to-b from-blue-500/10 to-purple-500/10 border border-blue-500/30' 
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-sm font-semibold text-white flex items-center gap-1 shadow-lg shadow-blue-500/25">
                    <Sparkles className="w-4 h-4" />
                    Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                  <p className="text-zinc-400 text-sm h-10">{tier.description}</p>
                </div>

                <div className="mb-8 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{tier.price}</span>
                  {tier.period && <span className="text-zinc-500">{tier.period}</span>}
                </div>

                <ul className="flex flex-col gap-4 mb-8 flex-grow">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-zinc-300">
                      <Check className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => tier.ctaAction === 'waitlist' ? setIsModalOpen(true) : tier.ctaAction === 'beta' && router.push('/demo')}
                  className={`w-full py-4 rounded-full font-semibold transition-colors ${
                    tier.highlighted
                      ? 'bg-white text-black hover:bg-zinc-200'
                      : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {tier.cta}
                </button>
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
