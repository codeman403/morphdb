import { Database, LogOut, ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';
import { Skeleton, SkeletonHistoryRow } from '@/components/ui/Skeleton';

export default function HistoryLoading() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" />
              <span className="font-bold tracking-tight hidden sm:inline">MorphDB</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="w-20 h-5 hidden sm:block" />
            <div className="px-3 py-1.5 border border-white/10 rounded-full">
              <Skeleton className="w-16 h-4" />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Skeleton className="w-48 h-8 mb-2" />
            <Skeleton className="w-64 h-5" />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <div className="w-64 h-10 bg-white/5 border border-white/10 rounded-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-white/[0.02] text-xs font-medium text-zinc-400">
            <div className="col-span-4 sm:col-span-3">Batch ID / Date</div>
            <div className="col-span-4 sm:col-span-3">Dialect Map</div>
            <div className="col-span-2 hidden sm:block text-center">Status</div>
            <div className="col-span-4 sm:col-span-4 text-right">Stats</div>
          </div>
          
          <div className="divide-y border-white/5">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonHistoryRow key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
