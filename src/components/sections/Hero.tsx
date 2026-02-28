'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import GridBeams from '@/components/ui/backgrounds/GridBeams';

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center pt-32 pb-20 overflow-hidden bg-slate-950">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] pointer-events-none" />

      {/* Dynamic Background Effect */}
      <GridBeams />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          className="flex flex-col items-center gap-6 mb-16 max-w-5xl"
        >
          {/* 1. Top - Largest: Tagline - Both Lines */}
          <motion.div
            variants={itemVariants}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-center leading-tight mb-4"
          >
            <span className="block text-white">
              Legacy schemas in.
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 animate-gradient-x">
              Modern data stacks out.
            </span>
          </motion.div>

          {/* 2. Middle - Medium/Large: Headline */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-slate-400 text-center max-w-3xl flex items-center justify-center gap-2"
          >
            Flawless migrations powered by 
            <span className="relative inline-flex items-center gap-1 text-emerald-400 font-bold">
              AI
              <Zap className="w-6 h-6 text-amber-400 fill-amber-400/20 animate-pulse" />
            </span>
          </motion.div>

          {/* 3. Bottom - Small/Medium: Description + Pill */}
          <motion.div 
            variants={itemVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col items-center gap-4"
          >
            <p className="text-lg text-slate-400 text-center max-w-2xl leading-relaxed">
              Automatically translate decades-old Oracle and SQL Server logic into clean, 
              native dbt models for Snowflake and BigQuery.
            </p>
            
            {/* Pill Badge moved here */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 mt-2 shadow-sm shadow-emerald-900/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-slate-300">The AI Co-Pilot for Data Engineers</span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-4 pt-6"
          >
            <Link
              href="/demo"
              className="relative group px-8 py-4 bg-transparent overflow-hidden rounded-full transition-all hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 border border-emerald-500/50 rounded-full" />
              <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-md group-hover:bg-emerald-500/20 transition-all duration-500" />
              <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
              <div className="relative flex items-center justify-center gap-2 text-lg font-bold text-emerald-100 group-hover:text-white transition-colors">
                Quick Demo 
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-emerald-400 group-hover:text-emerald-200" />
              </div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Cinematic Visual - Open Holographic Platform */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
          animate={isVisible ? { opacity: 1, scale: 1, rotateX: 0 } : { opacity: 0, scale: 0.9, rotateX: 20 }}
          transition={{ duration: 1.5, delay: 1.6, ease: "easeOut" }}
          className="w-full relative h-[300px] mt-8 max-w-7xl mx-auto perspective-1000"
        >
           {/* Base Platform / Grid Floor */}
           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[150px] bg-emerald-900/10 blur-[80px] rounded-full pointer-events-none" />
           
           {/* Main Content Container */}
           <div className="absolute inset-0 flex items-center justify-center">

              {/* LEFT SIDE: "Raw Data" Stream */}
              <div className="flex-1 h-24 relative overflow-hidden flex items-center justify-start pl-4">
                  {/* Connection Rail */}
                  <div className="absolute top-1/2 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-slate-700 to-emerald-900/50" />
                  
                  {/* Incoming Packets */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={`in-${i}`}
                        initial={{ x: '-100%' }}
                        animate={{ x: '150%' }}
                        transition={{ 
                            duration: 3, 
                            repeat: Infinity, 
                            delay: i * 2, 
                            ease: "linear",
                            repeatDelay: 3 // Wait for others to pass
                        }}
                        style={{ opacity: 1 }}
                        className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-3 pl-8"
                    >
                        <motion.div 
                            animate={{ opacity: [0, 1, 1, 0] }}
                            transition={{ 
                                duration: 3, 
                                times: [0, 0.1, 0.9, 1], 
                                repeat: Infinity, 
                                delay: i * 2, 
                                ease: "linear",
                                repeatDelay: 3 
                            }}
                            className="flex items-center gap-3"
                        >
                            <div className="px-3 py-1.5 rounded-md bg-slate-800 border border-slate-600 shadow-lg whitespace-nowrap z-10">
                                <span className="text-xs sm:text-sm font-mono text-slate-300 font-medium">
                                  {['Oracle', 'SQL Server', 'MySQL'][i]}
                                </span>
                            </div>
                            <div className="w-3 h-3 bg-slate-400 rotate-45 z-10" />
                        </motion.div>
                    </motion.div>
                  ))}
              </div>

              {/* Central AI Core - "The Engine" */}
              <div className="relative z-20 mx-4 sm:mx-10 shrink-0">
                {/* Spinning Reactor Rings */}
                <div className="relative w-32 h-32 sm:w-48 sm:h-48 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 border-l-transparent"
                    />
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-4 rounded-full border-2 border-cyan-500/30 border-b-cyan-400 border-r-transparent"
                    />
                    
                    {/* Inner Cube/Prism Representation */}
                    <div className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-900 border border-emerald-500/50 backdrop-blur-xl relative flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.4)] transform rotate-45 z-10">
                        <div className="absolute inset-0 bg-emerald-500/10 animate-pulse" />
                        <Zap className="w-8 h-8 sm:w-12 sm:h-12 text-emerald-400 fill-emerald-400/50 transform -rotate-45 drop-shadow-[0_0_10px_rgba(52,211,153,1)]" />
                    </div>
                </div>
              </div>

              {/* RIGHT SIDE: "Polished Data" Stream */}
              <div className="flex-1 h-32 relative overflow-hidden flex items-center justify-start pl-4">
                   {/* Connection Rail */}
                   <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-900/50 via-emerald-500/50 to-transparent" />

                   {/* Outgoing Packets */}
                   {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={`out-${i}`}
                        initial={{ x: '-50%' }}
                        animate={{ x: '200%' }}
                        transition={{ 
                            duration: 3, 
                            repeat: Infinity, 
                            delay: i * 2, 
                            ease: "linear",
                            repeatDelay: 3 
                        }}
                        style={{ opacity: 1 }}
                        className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-3 pl-8"
                    >
                        <motion.div 
                            animate={{ opacity: [0, 1, 1, 0] }}
                            transition={{ 
                                duration: 3, 
                                times: [0, 0.1, 0.9, 1], 
                                repeat: Infinity, 
                                delay: i * 2, 
                                ease: "linear",
                                repeatDelay: 3 
                            }}
                            className="flex items-center gap-3"
                        >
                            <div className="w-3 h-3 bg-emerald-400 rotate-45 shadow-[0_0_10px_rgba(52,211,153,0.8)] z-10" />
                            <div className="px-3 py-1.5 rounded-md bg-emerald-950/80 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)] whitespace-nowrap z-10">
                                <span className="text-xs sm:text-sm font-mono text-emerald-300 font-bold">
                                  {['Snowflake', 'Redshift', 'BigQuery'][i]}
                                </span>
                            </div>
                        </motion.div>
                    </motion.div>
                  ))}
              </div>

           </div>
        </motion.div>

      </div>
    </section>
  );
}
