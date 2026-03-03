'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { BrainCircuit, ShieldCheck, Database } from 'lucide-react';
import { useRef } from 'react';

const features = [
  {
    title: 'AI Translation Engine',
    description: 'Instantly convert legacy Oracle, SQL Server, and Teradata procedures into clean, modern SQL dialects tailored for the cloud.',
    icon: BrainCircuit,
    color: 'from-blue-500 to-cyan-400',
    delay: 0,
  },
  {
    title: '100% Logic Preservation',
    description: 'Guaranteed semantic equivalence. We map complex legacy logic with mathematical precision, ensuring zero data loss or behavior drift.',
    icon: ShieldCheck,
    color: 'from-purple-500 to-pink-400',
    delay: 0.1,
  },
  {
    title: 'Native dbt Output',
    description: 'Outputs are not just raw SQL. MorphDB generates ready-to-deploy, modular dbt models with built-in lineage, tests, and documentation.',
    icon: Database,
    color: 'from-emerald-500 to-teal-400',
    delay: 0.2,
  }
];

export default function Features() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]); // Moves faster/further
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <section id="features" className="relative py-24 overflow-visible" ref={containerRef}>
      {/* No background - inherits from parent */}
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-white mb-6"
          >
            Migration without the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">migraines.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Our proprietary AI engine understands the deep semantics of your legacy databases, 
            automating the most painful parts of your cloud migration journey.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const y = index === 1 ? y2 : y1;
            return (
              <motion.div
                key={feature.title}
                style={{ y }} // Parallax effect
                className="relative"
              >
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }} // Staggered delay
                  className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:bg-slate-800/50 hover:border-emerald-500/30 transition-colors duration-300 h-full group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} p-0.5 mb-6 opacity-80 group-hover:opacity-100 transition-opacity`}>
                    <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
