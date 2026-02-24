import Link from 'next/link';
import { ArrowRight, Terminal, Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-300 mb-8">
          <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          MorphDB Beta is live
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 max-w-4xl">
          Legacy schemas in. <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Modern data stacks out.
          </span>
        </h1>

        {/* Subtitle */}
        <div className="flex flex-col gap-4 mb-10 max-w-2xl">
          <div className="text-2xl md:text-3xl font-medium flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span className="text-zinc-200">Flawless database migrations</span>
            <span className="inline-flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              powered by AI <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
            </span>
          </div>
          <p className="text-base md:text-lg text-zinc-400 leading-relaxed">
            The AI Co-Pilot for Data Engineers. Automatically translate decades-old Oracle <br className="hidden md:block" />
            and SQL Server logic into clean, native dbt models for Snowflake and BigQuery.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href="/demo" className="w-full sm:w-auto px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
            Start Migrating <ArrowRight className="w-5 h-5" />
          </Link>
          <button className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-full hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
            <Terminal className="w-5 h-5 text-zinc-400" /> Read the Docs
          </button>
        </div>

        {/* Mock Terminal/Code Snippet */}
        <div className="mt-20 w-full max-w-4xl bg-black/40 border border-white/10 rounded-2xl p-4 backdrop-blur-xl shadow-2xl overflow-hidden relative">
          <div className="flex items-center gap-2 mb-4 px-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <div className="ml-2 text-xs text-zinc-500 font-mono">migration.ts</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left font-mono text-sm">
            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="text-zinc-500 mb-2">-- Source: SQL Server</div>
              <pre className="text-red-400/80 overflow-x-auto">
                <code>
{`SELECT TOP 10 
  ISNULL(CustomerName, 'Unknown'),
  GETDATE() as ExportDate
FROM [LegacyDB].[dbo].[Users] WITH (NOLOCK)`}
                </code>
              </pre>
            </div>
            <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
              <div className="text-blue-400 mb-2">-- Target: Snowflake (dbt)</div>
              <pre className="text-green-400/80 overflow-x-auto">
                <code>
{`select
  coalesce(customer_name, 'Unknown') as customer_name,
  current_timestamp() as export_date
from {{ source('legacy', 'users') }}
limit 10;`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
