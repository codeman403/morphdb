'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, ArrowRight, Sparkles, CheckCircle2, Clock, Loader2,
  AlertTriangle, Zap, ChevronDown, Copy, Check,
} from 'lucide-react';

const EXAMPLES = [
  {
    label: 'NULL Handling',
    sql: `SELECT 
  ISNULL(CustomerName, 'Unknown') as name,
  ISNULL(Email, 'N/A') as email
FROM [LegacyDB].[dbo].[Customers]
WHERE IsActive = 1`,
    source: 'sql_server' as const,
    target: 'snowflake_dbt' as const,
  },
  {
    label: 'Date Functions',
    sql: `SELECT 
  CustomerID,
  GETDATE() as run_date,
  DATEADD(day, 30, OrderDate) as due_date,
  DATEDIFF(day, OrderDate, GETDATE()) as age_days
FROM [LegacyDB].[dbo].[Orders]`,
    source: 'sql_server' as const,
    target: 'snowflake_dbt' as const,
  },
  {
    label: 'TOP → LIMIT',
    sql: `SELECT TOP 100
  p.ProductID,
  p.ProductName,
  SUM(od.Quantity) as total_sold
FROM [LegacyDB].[dbo].[Products] p WITH (NOLOCK)
JOIN [LegacyDB].[dbo].[OrderDetails] od ON p.ProductID = od.ProductID
GROUP BY p.ProductID, p.ProductName
ORDER BY total_sold DESC`,
    source: 'sql_server' as const,
    target: 'snowflake_dbt' as const,
  },
  {
    label: 'Oracle → Postgres',
    sql: `SELECT 
  NVL(employee_name, 'Unknown') as name,
  SYSDATE as run_date,
  ROWNUM as row_num,
  DECODE(status, 'A', 'Active', 'I', 'Inactive', 'Unknown') as status_label
FROM employees
WHERE ROWNUM <= 50`,
    source: 'oracle' as const,
    target: 'postgresql' as const,
  },
];

const SOURCE_DIALECTS = [
  { value: 'sql_server', label: 'SQL Server' },
  { value: 'oracle', label: 'Oracle' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
];

const TARGET_DIALECTS = [
  { value: 'snowflake_dbt', label: 'Snowflake (dbt)' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'bigquery', label: 'BigQuery' },
  { value: 'redshift', label: 'Redshift' },
];

interface TranslationResult {
  translatedSql: string;
  changes: string[];
  warnings: string[];
  tokensUsed: number;
  durationMs: number;
}

export default function DemoPage() {
  const [sql, setSql] = useState(EXAMPLES[0].sql);
  const [sourceDialect, setSourceDialect] = useState(EXAMPLES[0].source);
  const [targetDialect, setTargetDialect] = useState(EXAMPLES[0].target);
  const [isTranslating, setIsTranslating] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState('gpt-4o-mini');
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleTranslate = async () => {
    setIsTranslating(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql, sourceDialect, targetDialect, model }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Translation failed');
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleExampleChange = (idx: number) => {
    const ex = EXAMPLES[idx];
    setSql(ex.sql);
    setSourceDialect(ex.source);
    setTargetDialect(ex.target);
    setResult(null);
    setError(null);
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.translatedSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white">
            <Database className="w-6 h-6 text-blue-500" />
            <span className="font-bold text-lg tracking-tight">MorphDB</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-medium">
              AI-Powered • Developer Beta
            </span>
            <Link href="/waitlist" className="px-4 py-2 text-sm font-medium text-white bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition-colors">
              Get Early Access
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-16">
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400 mb-6"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            Real AI Migration Engine
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            Translate any <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">SQL dialect</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-lg max-w-xl mx-auto"
          >
            Paste your SQL, pick source &amp; target dialects, and let AI handle the translation. Every function, type, and convention — converted automatically.
          </motion.p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {EXAMPLES.map((ex, i) => (
            <button key={ex.label} onClick={() => handleExampleChange(i)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                sql === ex.sql ? 'bg-white text-black border-white' : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10'
              }`}
            >
              {ex.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">From</span>
            <select
              value={sourceDialect}
              onChange={(e) => setSourceDialect(e.target.value as typeof sourceDialect)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
            >
              {SOURCE_DIALECTS.map(d => (
                <option key={d.value} value={d.value} className="bg-zinc-900">{d.label}</option>
              ))}
            </select>
          </div>
          <ArrowRight className="w-5 h-5 text-zinc-600 self-center" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">To</span>
            <select
              value={targetDialect}
              onChange={(e) => setTargetDialect(e.target.value as typeof targetDialect)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
            >
              {TARGET_DIALECTS.map(d => (
                <option key={d.value} value={d.value} className="bg-zinc-900">{d.label}</option>
              ))}
            </select>
          </div>
          <div className="w-px h-6 bg-white/10 self-center mx-1" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">AI Model</span>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer"
            >
              <option value="gpt-4o-mini" className="bg-zinc-900">GPT-4o Mini</option>
              <option value="claude-haiku" className="bg-zinc-900">Claude Haiku</option>
              <option value="claude-sonnet" className="bg-zinc-900">Claude Sonnet</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-2 text-xs text-zinc-500 font-mono">source.sql</span>
              <span className="ml-auto text-xs text-zinc-600">{sql.length.toLocaleString()} chars</span>
            </div>
            <textarea
              value={sql}
              onChange={(e) => { setSql(e.target.value); setResult(null); setError(null); }}
              placeholder="Paste your SQL here..."
              className="w-full p-6 text-sm font-mono text-red-400/80 leading-relaxed bg-transparent resize-none focus:outline-none min-h-[280px]"
              spellCheck={false}
            />
          </div>

          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-blue-500/[0.05]">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-2 text-xs text-blue-400 font-mono">output.sql</span>
              {result && (
                <button onClick={handleCopy} className="ml-auto flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors">
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>
            <div className="p-6 min-h-[280px] flex items-start">
              <AnimatePresence mode="wait">
                {isTranslating ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col gap-3 w-full"
                  >
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="h-4 rounded bg-white/5 animate-pulse"
                        style={{ width: `${Math.random() * 40 + 50}%`, animationDelay: `${i * 0.08}s` }}
                      />
                    ))}
                    <p className="text-xs text-zinc-600 mt-2">AI is translating your SQL...</p>
                  </motion.div>
                ) : error ? (
                  <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-start gap-3 text-red-400"
                  >
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm">{error}</p>
                  </motion.div>
                ) : result ? (
                  <motion.pre key="output" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ ease: [0.16, 1, 0.3, 1] }}
                    className="text-sm font-mono text-green-400/80 leading-relaxed overflow-x-auto whitespace-pre w-full"
                  >
                    {result.translatedSql}
                  </motion.pre>
                ) : (
                  <motion.div key="placeholder" className="text-zinc-600 text-sm font-mono flex flex-col gap-2">
                    <p>← Click &quot;Translate&quot; to see the magic ✨</p>
                    <p className="text-xs text-zinc-700">Powered by {model === 'gpt-4o-mini' ? 'GPT-4o Mini' : model === 'claude-haiku' ? 'Claude Haiku' : 'Claude Sonnet'} • Real AI translation</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <button onClick={handleTranslate} disabled={isTranslating || !sql.trim()}
            className="flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-2xl hover:bg-zinc-200 transition-colors disabled:opacity-50 shadow-lg"
          >
            {isTranslating ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Translating...</>
            ) : (
              <><Zap className="w-5 h-5" /> Translate with AI</>
            )}
          </button>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 mb-10"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{(result.durationMs / 1000).toFixed(1)}s</div>
                  <div className="text-xs text-zinc-500 mt-1">Translation Time</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{result.changes.length}</div>
                  <div className="text-xs text-zinc-500 mt-1">Transformations</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">{result.tokensUsed}</div>
                  <div className="text-xs text-zinc-500 mt-1">Tokens Used</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-amber-400">{result.warnings.length}</div>
                  <div className="text-xs text-zinc-500 mt-1">Warnings</div>
                </div>
              </div>

              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mx-auto"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
                {showDetails ? 'Hide' : 'Show'} transformation details
              </button>

              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {result.changes.length > 0 && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                      <h3 className="text-sm font-medium text-blue-400 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Transformations Applied
                      </h3>
                      <ul className="space-y-2">
                        {result.changes.map((c, i) => (
                          <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span> {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.warnings.length > 0 && (
                    <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-5">
                      <h3 className="text-sm font-medium text-amber-400 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Warnings
                      </h3>
                      <ul className="space-y-2">
                        {result.warnings.map((w, i) => (
                          <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                            <span className="text-amber-500 mt-1">•</span> {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

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
