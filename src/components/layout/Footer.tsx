'use client';

import Link from 'next/link';
import { Database } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative border-t border-emerald-500/20 bg-slate-950/80 backdrop-blur-md pt-16 pb-8 overflow-visible shadow-lg shadow-emerald-500/5">
      {/* Inherits background from parent */}
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-white hover:text-emerald-400 transition-colors mb-4">
              <Database className="w-6 h-6 text-emerald-500" />
              <span className="font-bold text-lg tracking-tight">MorphDB</span>
            </Link>
            <p className="text-zinc-400 max-w-sm leading-relaxed mb-6">
              The AI Co-Pilot for Data Engineers. Flawless database migrations from legacy systems to modern cloud data warehouses.
            </p>
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 max-w-md">
              <p className="text-xs text-zinc-400 leading-relaxed">
                <strong className="text-zinc-300 font-medium">Developer Beta:</strong> MorphDB is in active development. While fully functional, you may encounter occasional bugs or feature limitations. We continuously deploy fixes and optimizations.
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="flex flex-col gap-3 text-sm text-zinc-400">
              <li><Link href="#features" className="hover:text-emerald-400 transition-colors">Features</Link></li>
              <li><Link href="#how-it-works" className="hover:text-emerald-400 transition-colors">How it Works</Link></li>
              <li><Link href="#pricing" className="hover:text-emerald-400 transition-colors">Pricing</Link></li>
              <li><Link href="/support" className="hover:text-emerald-400 transition-colors">Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="flex flex-col gap-3 text-sm text-zinc-400">
              <li><Link href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-emerald-400 transition-colors">Security</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} MorphDB. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
