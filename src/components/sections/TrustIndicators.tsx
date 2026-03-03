'use client';

import { motion } from 'framer-motion';

const sourceLogos = [
  { name: 'Oracle', color: '#F80000' },
  { name: 'SQL Server', color: '#CC2927' },
];

const targetLogos = [
  { name: 'Snowflake', color: '#29B5E8' },
  { name: 'BigQuery', color: '#4285F4' },
  { name: 'Redshift', color: '#8C4FFF' },
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
        {/* Technology Logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
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
      </div>
    </section>
  );
}
