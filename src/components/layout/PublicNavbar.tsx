'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Database, ChevronRight, LogOut, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function PublicNavbar() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Try to get user session if Supabase is configured
    const initAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          fetch('/api/auth/profile').then(r => r.json()).then(d => setFirstName(d.firstName)).catch(() => {});
        }
      } catch {
        // Supabase not configured, continue without auth
      }
      setLoading(false);
    };
    
    initAuth();
  }, []);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Demo', href: '/demo' },
    { label: 'Docs', href: '/docs' },
    { label: 'Support', href: '/support' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
          <Database className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
          <span className="font-bold tracking-tight hidden sm:inline text-lg">MorphDB</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth / Right Side */}
        <div className="hidden md:flex items-center gap-4">
          {!loading && user ? (
            <>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <User className="w-4 h-4" />
                {firstName ?? user.email?.split('@')[0]}
              </div>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white border border-slate-700 rounded-full hover:bg-slate-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="group flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-slate-800 border border-slate-700 rounded-full hover:bg-slate-700 hover:border-emerald-500/50 hover:text-emerald-400 transition-all"
            >
              Sign In 
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {mobileMenuOpen ? (
            <span className="text-2xl font-light">×</span>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 absolute top-16 left-0 right-0 shadow-2xl">
          <div className="px-6 py-6 space-y-4">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-base font-medium text-slate-400 hover:text-emerald-400 hover:pl-2 transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-6 mt-4 border-t border-slate-800">
              {!loading && user ? (
                <form action="/api/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </form>
              ) : (
                <Link
                  href="/login"
                  className="block w-full text-center px-4 py-3 text-sm font-bold text-slate-950 bg-emerald-500 rounded-lg hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
