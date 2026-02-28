'use client';

import { motion } from 'framer-motion';
import { Database, Sparkles, Cloud, ArrowRight, ArrowDown } from 'lucide-react';
import GridBeams from '@/components/ui/backgrounds/GridBeams';

const steps = [
  {
    title: 'Legacy DB',
    subtitle: 'Oracle, SQL Server, Teradata',
    description: 'Connect your decades-old legacy databases. We extract the raw schemas, stored procedures, and complex business logic.',
    icon: Database,
    glow: 'bg-orange-500/20',
    iconColor: 'text-orange-400',
    borderColor: 'border-orange-500/20'
  },
  {
    title: 'MorphDB AI',
    subtitle: 'Semantic Translation',
    description: 'Our deterministic AI engine parses the legacy syntax, maps it to an intermediate AST, and reconstructs it with 100% logic preservation.',
    icon: Sparkles,
    glow: 'bg-purple-500/20',
    iconColor: 'text-purple-400',
    borderColor: 'border-purple-500/20'
  },
  {
    title: 'Cloud Data Warehouse',
    subtitle: 'Snowflake, BigQuery, dbt',
    description: 'Deploy clean, performant, native dbt models directly into your modern data stack, ready for production analytics.',
    icon: Cloud,
    glow: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/20'
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 overflow-hidden bg-slate-950">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-emerald-500/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[300px] bg-cyan-500/15 blur-[100px] rounded-full pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] pointer-events-none" />

      {/* Dynamic Background Effect */}
      <GridBeams />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 mb-6"
          >
            The Pipeline
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold text-white mb-6"
          >
            How it <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">works</span>
          </motion.h2>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          {steps.map((step, index) => (
            <div key={step.title} className="flex flex-col md:flex-row items-center w-full md:w-1/3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className={`w-full h-full bg-slate-900/50 backdrop-blur-sm border ${step.borderColor} rounded-2xl p-8 relative group hover:-translate-y-1 transition-all duration-300 shadow-xl`}
              >
                {/* Glow effect */}
                <div className={`absolute -inset-px rounded-2xl ${step.glow} opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl`} />
                
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className={`w-7 h-7 ${step.iconColor} drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-xs font-mono font-medium text-slate-500 mb-4 tracking-wide uppercase">{step.subtitle}</p>
                  <p className="text-slate-400 leading-relaxed text-sm">
                    {step.description}
                  </p>
                </div>
              </motion.div>

              {/* Arrow connector (hidden on last item) */}
              {index < steps.length - 1 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 + 0.1 }}
                  className="hidden md:flex flex-shrink-0 items-center justify-center w-12 h-12 text-slate-600 my-4 md:my-0"
                >
                  <ArrowRight className="w-8 h-8" />
                </motion.div>
              )}
              {index < steps.length - 1 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 + 0.1 }}
                  className="flex md:hidden flex-shrink-0 items-center justify-center h-12 text-slate-600 my-4"
                >
                  <ArrowDown className="w-8 h-8" />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
