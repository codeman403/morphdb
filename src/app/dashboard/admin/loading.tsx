import { Database, ArrowLeft, RefreshCw, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageBackground } from '@/components/ui/backgrounds/PageBackground';

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-emerald-500/20 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <Database className="w-6 h-6 text-emerald-500" />
              <span className="font-bold text-lg tracking-tight">MorphDB</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-medium">Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-24 h-9 rounded-full" />
            <Skeleton className="w-28 h-9 rounded-full" />
            <Skeleton className="w-20 h-9 rounded-full" />
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 border border-emerald-500/20 rounded-full">
              <Settings className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 border border-emerald-500/20 rounded-full">
              <LogOut className="w-4 h-4" />
            </div>
          </div>
        </div>
      </nav>

      <PageBackground variant="intense" className="flex-grow pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-slate-900/50 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-8 h-8 rounded-lg" />
                </div>
                <Skeleton className="w-16 h-8" />
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="w-32 h-10 rounded-full" />
            ))}
          </div>

          {/* Table */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-emerald-500/20 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-emerald-500/20">
                    {[...Array(5)].map((_, i) => (
                      <th key={i} className="text-left p-4">
                        <Skeleton className="w-20 h-4" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...Array(8)].map((_, rowIndex) => (
                    <tr key={rowIndex} className="border-b border-white/5">
                      {[...Array(5)].map((_, colIndex) => (
                        <td key={colIndex} className="p-4">
                          <Skeleton className={`h-4 ${colIndex === 0 ? 'w-40' : colIndex === 4 ? 'w-16' : 'w-24'}`} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Loading indicator */}
          <div className="flex items-center justify-center gap-3 text-zinc-400 mt-8">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Loading admin dashboard...
          </div>
        </div>
      </PageBackground>
    </div>
  );
}
