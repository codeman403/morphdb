import { Database, ArrowLeft, ArrowRight, Upload, FileText } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageBackground } from '@/components/ui/backgrounds/PageBackground';

export default function MigrateLoading() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-emerald-500/20 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-500" />
              <span className="font-bold text-lg tracking-tight hidden sm:inline">MorphDB</span>
              <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-medium">
                Developer Beta
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Skeleton className="w-24 h-5 hidden md:block" />
            <Skeleton className="w-20 h-8 rounded-full" />
            <Skeleton className="w-20 h-8 rounded-full" />
          </div>
        </div>
      </nav>

      <PageBackground variant="intense" className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-8">
            <Skeleton className="w-48 h-8 mb-2" />
            <Skeleton className="w-96 h-5" />
          </div>

          {/* Dialect Selectors */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">From</span>
              <Skeleton className="w-32 h-10 rounded-lg" />
            </div>
            <ArrowRight className="w-5 h-5 text-zinc-600 self-center" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">To</span>
              <Skeleton className="w-32 h-10 rounded-lg" />
            </div>
            <div className="w-px h-6 bg-white/10 self-center mx-1" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">AI Model</span>
              <Skeleton className="w-32 h-10 rounded-lg" />
            </div>
          </div>

          {/* Upload Areas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* File Drop Zone */}
            <div className="border-2 border-dashed border-emerald-500/20 rounded-2xl p-8 text-center">
              <Upload className="w-10 h-10 mx-auto mb-4 text-zinc-600" />
              <p className="text-sm text-zinc-300 mb-1">Drop .sql files here or click to browse</p>
              <p className="text-xs text-zinc-600">Supports .sql and .txt files</p>
            </div>

            {/* SQL Paste Area */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-emerald-500/20 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-emerald-500/20 bg-white/[0.02]">
                <FileText className="w-4 h-4 text-zinc-500" />
                <span className="text-xs text-zinc-500 font-mono">paste SQL directly</span>
              </div>
              <div className="p-4 min-h-[250px]">
                <Skeleton className="w-full h-4 mb-2" />
                <Skeleton className="w-3/4 h-4 mb-2" />
                <Skeleton className="w-5/6 h-4 mb-2" />
                <Skeleton className="w-2/3 h-4" />
              </div>
            </div>
          </div>

          {/* Translate Button */}
          <div className="flex justify-center">
            <Skeleton className="w-48 h-14 rounded-2xl" />
          </div>
        </div>
      </PageBackground>
    </div>
  );
}
