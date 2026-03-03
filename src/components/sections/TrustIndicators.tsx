'use client';

import { motion } from 'framer-motion';
import { Shield, Zap, Code2, Database } from 'lucide-react';

const stats = [
  { value: '10,000+', label: 'Lines Translated', icon: Code2 },
  { value: '99.2%', label: 'Accuracy Rate', icon: Zap },
  { value: '6+', label: 'Databases Supported', icon: Database },
  { value: '256-bit', label: 'Encryption', icon: Shield },
];

const sourceLogos = [
  { name: 'Oracle', color: '#F80000' },
  { name: 'SQL Server', color: '#CC2927' },
  { name: 'Teradata', color: '#F37440' },
];

const targetLogos = [
  { name: 'Snowflake', color: '#29B5E8' },
  { name: 'BigQuery', color: '#4285F4' },
  { name: 'Redshift', color: '#8C4FFF' },
  { name: 'dbt', color: '#FF694A' },
];

function LogoBadge({ name, color }: { name: string; color: string }) {
  return (
    <div 
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-700/50 hover:border-slate-600 transition-colors"
    >
      <div 
        className="w-3 h-3 rounded-full" 
        style={{ backgroundColor: color }}
      />
      <span className="text-sm text-zinc-300 font-medium">{name}</span>
    </div>
  );
}

export default function TrustIndicators() {
  return (
    <section className="relative py-16 overflow-visible">
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6 rounded-2xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-sm"
            >
              <stat.icon className="w-6 h-6 text-emerald-400 mx-auto mb-3" />
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-zinc-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Technology Logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <p className="text-zinc-500 text-sm uppercase tracking-wider mb-6">
            Migrate From & To Leading Platforms
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            {/* Source databases */}
            <div className="flex flex-wrap justify-center gap-3">
              {sourceLogos.map((logo) => (
                <LogoBadge key={logo.name} name={logo.name} color={logo.color} />
              ))}
            </div>
            
            {/* Arrow */}
            <div className="hidden md:flex items-center text-emerald-400">
              <svg 
                className="w-8 h-8" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 7l5 5m0 0l-5 5m5-5H6" 
                />
              </svg>
            </div>
            <div className="md:hidden text-emerald-400 my-2">
              <svg 
                className="w-6 h-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 14l-7 7m0 0l-7-7m7 7V3" 
                />
              </svg>
            </div>
            
            {/* Target databases */}
            <div className="flex flex-wrap justify-center gap-3">
              {targetLogos.map((logo) => (
                <LogoBadge key={logo.name} name={logo.name} color={logo.color} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-6 mt-12 pt-12 border-t border-slate-800/50"
        >
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>SOC 2 Compliant Infrastructure</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>No Data Storage</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>GDPR Ready</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
