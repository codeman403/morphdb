'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, ArrowRight, Sparkles, CheckCircle2, Clock, Loader2, ChevronDown } from 'lucide-react';

const EXAMPLES = [
  {
    label: 'NULL Handling',
    source: `SELECT 
  ISNULL(CustomerName, 'Unknown') as name,
  ISNULL(Email, 'N/A') as email
FROM [LegacyDB].[dbo].[Customers]
WHERE IsActive = 1`,
    target: `select
  coalesce(customer_name, 'Unknown') as name,
  coalesce(email, 'N/A') as email
from {{ source('legacy', 'customers') }}
where is_active = true`,
  },
  {
    label: 'Date Functions',
    source: `SELECT 
  CustomerID,
  GETDATE() as run_date,
  DATEADD(day, 30, OrderDate) as due_date,
  DATEDIFF(day, OrderDate, GETDATE()) as age_days
FROM [LegacyDB].[dbo].[Orders]`,
    target: `select
  customer_id,
  current_timestamp() as run_date,
  dateadd('day', 30, order_date) as due_date,
  datediff('day', order_date, current_timestamp()) as age_days
from {{ source('legacy', 'orders') }}`,
  },
  {
    label: 'TOP → LIMIT',
    source: `SELECT TOP 100
  p.ProductID,
  p.ProductName,
  SUM(od.Quantity) as total_sold
FROM [LegacyDB].[dbo].[Products] p WITH (NOLOCK)
JOIN [LegacyDB].[dbo].[OrderDetails] od ON p.ProductID = od.ProductID
GROUP BY p.ProductID, p.ProductName
ORDER BY total_sold DESC`,
    target: `select
  p.product_id,
  p.product_name,
  sum(od.quantity) as total_sold
from {{ source('legacy', 'products') }} p
join {{ source('legacy', 'order_details') }} od
  on p.product_id = od.product_id
group by 1, 2
order by total_sold desc
limit 100`,
  },
];

const STATS = [
  { label: 'Tables Translated', value: '142' },
  { label: 'Logic Preserved', value: '100%' },
  { label: 'Time Saved', value: '~340 hrs' },
];

export default function DemoPage() {
  const [selectedExample, setSelectedExample] = useState(0);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  const handleTranslate = () => {
    setIsTranslating(true);
    setShowOutput(false);
    setTimeout(() => {
      setIsTranslating(false);
      setShowOutput(true);
    }, 1800);
  };

  const handleExampleChange = (idx: number) => {
    setSelectedExample(idx);
    setShowOutput(false);
    setIsTranslating(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white">
            <Database className="w-6 h-6 text-blue-500" />
            <span className="font-bold text-lg tracking-tight">MorphDB</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">Migration Demo</span>
            <Link href="/waitlist" className="px-4 py-2 text-sm font-medium text-white bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition-colors">
              Get Early Access
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400 mb-6"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            Live AI Migration Demo
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            See MorphDB in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">action</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-lg max-w-xl mx-auto"
          >
            Paste your legacy SQL Server code and watch MorphDB translate it into production-ready dbt for Snowflake.
          </motion.p>
        </div>

        {/* Example Selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {EXAMPLES.map((ex, i) => (
            <button key={ex.label} onClick={() => handleExampleChange(i)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                selectedExample === i ? 'bg-white text-black border-white' : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10'
              }`}
            >
              {ex.label}
            </button>
          ))}
          <div className="flex items-center gap-1 px-4 py-2 rounded-full text-sm text-zinc-500 border border-white/5 bg-white/[0.02]">
            <ChevronDown className="w-4 h-4" /> More patterns
          </div>
        </div>

        {/* Translation Playground */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-stretch mb-10">
          {/* Input */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-2 text-xs text-zinc-500 font-mono">source.sql — SQL Server</span>
            </div>
            <pre className="p-6 text-sm font-mono text-red-400/80 leading-relaxed overflow-x-auto whitespace-pre">
              {EXAMPLES[selectedExample].source}
            </pre>
          </div>

          {/* Translate Button */}
          <div className="flex lg:flex-col items-center justify-center gap-2 py-4">
            <button onClick={handleTranslate} disabled={isTranslating}
              className="flex items-center gap-2 px-6 py-4 bg-white text-black font-semibold rounded-2xl hover:bg-zinc-200 transition-colors disabled:opacity-70 shadow-lg whitespace-nowrap"
            >
              {isTranslating ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Translating...</>
              ) : (
                <><Sparkles className="w-5 h-5" /> Translate <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
            {showOutput && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 text-xs text-green-400"
              >
                <CheckCircle2 className="w-4 h-4" /> Done in 1.8s
              </motion.div>
            )}
          </div>

          {/* Output */}
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-blue-500/[0.05]">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-2 text-xs text-blue-400 font-mono">output.sql — Snowflake (dbt)</span>
            </div>
            <div className="p-6 min-h-[160px] flex items-start">
              <AnimatePresence mode="wait">
                {isTranslating ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col gap-3 w-full"
                  >
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-4 rounded bg-white/5 animate-pulse"
                        style={{ width: `${Math.random() * 40 + 60}%`, animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </motion.div>
                ) : showOutput ? (
                  <motion.pre key="output" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ ease: [0.16, 1, 0.3, 1] }}
                    className="text-sm font-mono text-green-400/80 leading-relaxed overflow-x-auto whitespace-pre w-full"
                  >
                    {EXAMPLES[selectedExample].target}
                  </motion.pre>
                ) : (
                  <motion.p key="placeholder" className="text-zinc-600 text-sm font-mono">
                    ← Click &quot;Translate&quot; to see the magic ✨
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <AnimatePresence>
          {showOutput && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-3 gap-4 mb-10"
            >
              {STATS.map((stat) => (
                <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-zinc-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-zinc-400 text-sm mb-6">
            <Clock className="w-4 h-4" />
            Full schema migration estimated: <strong className="text-white">~8 minutes for 500 tables</strong>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/waitlist"
              className="px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors flex items-center gap-2"
            >
              Get Early Access <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/"
              className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-full hover:bg-white/10 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
