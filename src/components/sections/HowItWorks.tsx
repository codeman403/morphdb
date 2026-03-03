'use client';

import { motion } from 'framer-motion';
import { Database, Sparkles, Cloud, ArrowRight } from 'lucide-react';

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
    <section id="how-it-works" className="relative py-24 overflow-visible">
      {/* No background - inherits from parent */}
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

        {/* Desktop: Grid layout for equal heights */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 items-stretch">
          {steps.map((step, index) => (
            <div key={step.title} className="flex items-center gap-4">
              <motion.div
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.15,
                  ease: [0.25, 0.4, 0.25, 1]
                }}
                className={`flex-1 h-full bg-slate-900/50 backdrop-blur-sm border ${step.borderColor} rounded-2xl p-8 relative group hover:-translate-y-1 transition-all duration-300 shadow-xl`}
              >
                {/* Glow effect */}
                <div className={`absolute -inset-px rounded-2xl ${step.glow} opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl`} />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className={`w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className={`w-7 h-7 ${step.iconColor} drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-xs font-mono font-medium text-slate-500 mb-4 tracking-wide uppercase">{step.subtitle}</p>
                  <p className="text-slate-400 leading-relaxed text-sm flex-grow">
                    {step.description}
                  </p>
                </div>
              </motion.div>
              
              {/* Arrow connector (hidden on last item) */}
              {index < steps.length - 1 && (
                <div className="flex-shrink-0 text-slate-600">
                  <ArrowRight className="w-6 h-6" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile: Vertical stack */}
        <div className="flex md:hidden flex-col items-center gap-4">
          {steps.map((step, index) => (
            <div key={step.title} className="flex flex-col items-center w-full">
              <motion.div
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.15,
                  ease: [0.25, 0.4, 0.25, 1]
                }}
                className={`w-full bg-slate-900/50 backdrop-blur-sm border ${step.borderColor} rounded-2xl p-8 relative group hover:-translate-y-1 transition-all duration-300 shadow-xl`}
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
              
              {/* Mobile Arrow */}
              {index < steps.length - 1 && (
                <div className="text-slate-600 my-3">
                  <ArrowRight className="w-6 h-6 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
