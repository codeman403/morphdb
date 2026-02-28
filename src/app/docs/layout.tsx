'use client';

import Navbar from '@/components/layout/Navbar';
import { DocsNavigation, MobileDocsNavigation } from '@/components/docs/DocsNavigation';
import Footer from '@/components/layout/Footer';
import { PageBackground } from '@/components/ui/backgrounds/PageBackground';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar />

      <PageBackground variant="default" className="flex-grow pt-16">
        <div className="flex flex-col md:flex-row max-w-7xl mx-auto">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 min-h-[calc(100vh-4rem)] bg-slate-900/50 backdrop-blur-xl border-r border-emerald-500/10 py-8 relative z-10">
            <div className="px-6 sticky top-24">
              <DocsNavigation />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 px-6 md:px-8 py-8 md:py-12 relative z-10">
            <div className="max-w-4xl bg-slate-950/40 backdrop-blur-sm p-6 md:p-8 rounded-3xl border border-emerald-500/10 shadow-xl shadow-emerald-500/5">
              {children}
            </div>
          </main>

          {/* Mobile Navigation */}
          <MobileDocsNavigation />
        </div>
      </PageBackground>

      <Footer />
    </div>
  );
}
