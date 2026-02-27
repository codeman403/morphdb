'use client';

import Navbar from '@/components/layout/Navbar';
import { DocsNavigation, MobileDocsNavigation } from '@/components/docs/DocsNavigation';
import Footer from '@/components/layout/Footer';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      <div className="flex flex-col md:flex-row max-w-7xl mx-auto pt-16">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 min-h-screen bg-[#0a0a0a]/80 backdrop-blur-xl border-r border-white/10 py-8">
          <div className="px-6">
            <DocsNavigation />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-6 md:px-8 py-8 md:py-12">
          <div className="max-w-4xl">
            {children}
          </div>
        </main>

        {/* Mobile Navigation */}
        <MobileDocsNavigation />
      </div>

      <Footer />
    </div>
  );
}
