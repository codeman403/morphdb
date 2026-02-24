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
        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-8 max-w-4xl leading-tight">
          Legacy schemas in. <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Modern data stacks out.
          </span>
        </h1>

        {/* Subtitle */}
        <div className="flex flex-col gap-6 mb-12 max-w-3xl">
          <div className="text-xl md:text-2xl font-medium flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span className="text-zinc-200">Flawless database migrations</span>
            <span className="inline-flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              powered by AI <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            </span>
          </div>
          <p className="text-sm md:text-base text-zinc-400 leading-relaxed mx-auto max-w-2xl">
            The AI Co-Pilot for Data Engineers. Automatically translate decades-old Oracle <br className="hidden md:block" />
            and SQL Server logic into clean, native dbt models for Snowflake and BigQuery.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
          <Link href="/demo" className="w-full sm:w-auto px-8 py-3.5 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 text-sm">
            Quick Demo <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="https://github.com/codeman403/morphdb/blob/main/ARCHITECTURE.md" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-8 py-3.5 bg-white/5 border border-white/10 text-white font-semibold rounded-full hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-sm">
            <Terminal className="w-4 h-4 text-zinc-400" /> Read the Docs
          </a>
        </div>

        {/* Demo Video */}
        <div className="mt-20 w-full max-w-4xl rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto"
          >
            <source src="/demo.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
    </section>
  );
}
