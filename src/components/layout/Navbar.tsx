'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Database, ChevronRight, User, LogOut } from 'lucide-react';
import { animate } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

export default function Navbar() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    
    const initAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!error && session?.user) {
        setUser(session.user);
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          fetch('/api/auth/profile').then(r => r.json()).then(d => setFirstName(d.firstName));
        }
      } else {
        const { data: { session: refreshSession } } = await supabase.auth.refreshSession();
        if (refreshSession?.user) {
          setUser(refreshSession.user);
          fetch('/api/auth/profile').then(r => r.json()).then(d => setFirstName(d.firstName));
        }
      }
      setLoading(false);
    };
    
    initAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetch('/api/auth/profile').then(r => r.json()).then(d => setFirstName(d.firstName));
      } else {
        setFirstName(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      const navbarHeight = 64;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - navbarHeight;

      animate(window.scrollY, offsetPosition, {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1], 
        onUpdate: (latest) => window.scrollTo(0, latest)
      });
      
      window.history.pushState(null, '', `#${targetId}`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" onClick={(e) => {
          if (window.location.pathname === '/') {
            e.preventDefault();
            animate(window.scrollY, 0, {
              duration: 1.2,
              ease: [0.16, 1, 0.3, 1],
              onUpdate: (latest) => window.scrollTo(0, latest)
            });
            window.history.pushState(null, '', '/');
          }
        }} className="flex items-center gap-2 text-white">
          <Database className="w-6 h-6 text-blue-500" />
          <span className="font-bold text-lg tracking-tight">MorphDB</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <Link href="#features" onClick={(e) => handleScroll(e, 'features')} className="hover:text-white transition-colors">Features</Link>
          <Link href="#how-it-works" onClick={(e) => handleScroll(e, 'how-it-works')} className="hover:text-white transition-colors">How it Works</Link>
          <Link href="#pricing" onClick={(e) => handleScroll(e, 'pricing')} className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/support" className="hover:text-white transition-colors">Support</Link>
        </div>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="w-20 h-8 bg-white/5 rounded-full animate-pulse" />
          ) : user ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
                <User className="w-4 h-4" />
                {firstName ?? user.email?.split('@')[0]}
              </Link>
              <Link href="/dashboard" className="group relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition-all">
                Dashboard <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <form action="/api/auth/signout" method="POST">
                <button type="submit" className="flex items-center gap-1.5 px-3 py-2 text-sm text-zinc-500 hover:text-white border border-white/10 rounded-full hover:bg-white/5 transition-colors">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/waitlist" className="group relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition-all overflow-hidden">
                <span className="relative z-10 flex items-center gap-1">
                  Get Early Access <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
