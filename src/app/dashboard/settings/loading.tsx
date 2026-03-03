import { Database, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageBackground } from '@/components/ui/backgrounds/PageBackground';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function SettingsLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />

      <PageBackground
        variant="intense"
        className="flex-grow flex items-center justify-center px-6 py-24 pt-32 relative overflow-hidden"
      >
        <div className="w-full max-w-2xl relative z-10">
          {/* Back Button */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors mb-8 text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="bg-slate-950/80 backdrop-blur-md border border-emerald-500/20 shadow-lg shadow-emerald-500/5 rounded-3xl p-8">
            <Skeleton className="w-64 h-8 mb-2" />
            <Skeleton className="w-48 h-4 mb-8" />

            {/* Subscription Card Skeleton */}
            <div className="bg-white/5 border border-emerald-500/20 rounded-2xl p-6 mb-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Skeleton className="w-20 h-3 mb-2" />
                  <Skeleton className="w-24 h-8 mb-2" />
                  <Skeleton className="w-16 h-4" />
                </div>
                <div>
                  <Skeleton className="w-16 h-3 mb-2" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-3 h-3 rounded-full" />
                    <Skeleton className="w-24 h-5" />
                  </div>
                </div>
              </div>

              {/* Usage Info Skeleton */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <Skeleton className="w-20 h-3 mb-3" />
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Skeleton className="w-8 h-4 mb-1" />
                    <Skeleton className="w-20 h-3" />
                  </div>
                  <div>
                    <Skeleton className="w-8 h-4 mb-1" />
                    <Skeleton className="w-16 h-3" />
                  </div>
                  <div>
                    <Skeleton className="w-12 h-4 mb-1" />
                    <Skeleton className="w-24 h-3" />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button Skeleton */}
            <Skeleton className="w-full h-12 rounded-full" />
          </div>
        </div>
      </PageBackground>

      <Footer />
    </div>
  );
}
