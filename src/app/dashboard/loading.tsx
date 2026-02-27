import { Database, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white">
            <Database className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
            <span className="font-bold tracking-tight">MorphDB</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <Skeleton className="w-20 h-5 rounded-md" />
            </div>
            <div className="px-3 sm:px-4 py-2 border border-white/10 rounded-full">
              <Skeleton className="w-16 h-4" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="mb-8">
          <Skeleton className="w-24 h-6 rounded-full mb-6" />
          <Skeleton className="w-64 h-10 mb-2" />
          <Skeleton className="w-48 h-5" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <Skeleton className="w-32 h-6 mb-2" />
            <Skeleton className="w-48 h-4 mb-6" />
            <Skeleton className="w-full h-[200px] rounded-xl" />
          </div>
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <Skeleton className="w-32 h-6 mb-2" />
            <Skeleton className="w-48 h-4 mb-6" />
            <Skeleton className="w-full h-[200px] rounded-xl" />
          </div>
        </div>
      </main>
    </div>
  );
}
