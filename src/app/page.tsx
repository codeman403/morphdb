import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/sections/Hero';
import Features from '@/components/sections/Features';
import HowItWorks from '@/components/sections/HowItWorks';
import Pricing from '@/components/sections/Pricing';
import FAQ from '@/components/sections/FAQ';
import Footer from '@/components/layout/Footer';
import GridBeams from '@/components/ui/backgrounds/GridBeams';

export default function Home() {
  return (
    <main id="main-content" className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden relative">
      {/* Unified background for all sections */}
      <div className="fixed inset-0 -z-50">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-0 w-full max-w-3xl h-[400px] bg-cyan-500/15 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/3 left-0 w-full max-w-3xl h-[400px] bg-emerald-500/15 blur-[100px] rounded-full pointer-events-none" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]" />

        {/* Dynamic Background Effect */}
        <GridBeams />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <FAQ />
        <Footer />
      </div>
    </main>
  );
}
