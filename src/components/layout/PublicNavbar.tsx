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
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
          <Database className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
          <span className="font-bold tracking-tight hidden sm:inline">MorphDB</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-zinc-300 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth / Right Side */}
        <div className="hidden md:flex items-center gap-4">
          {!loading && user ? (
            <>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <User className="w-4 h-4" />
                {firstName ?? user.email?.split('@')[0]}
              </div>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white border border-white/10 rounded-full hover:bg-white/5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white border border-white/10 rounded-full hover:bg-white/10 transition-colors"
            >
              Sign In <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex items-center gap-2 text-white"
        >
          {mobileMenuOpen ? (
            <span className="text-2xl">×</span>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black/80 backdrop-blur-md border-b border-white/10">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-sm text-zinc-300 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-white/10">
              {!loading && user ? (
                <form action="/api/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </form>
              ) : (
                <Link
                  href="/login"
                  className="block text-sm font-medium text-white hover:text-blue-400 transition-colors py-2"
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
