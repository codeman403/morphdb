'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Database, ChevronRight, User, LogOut } from 'lucide-react';
import { animate } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';

export default function Navbar() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === '/';

  useEffect(() => {
    const supabase = createClient();
    
    const initAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!error && session?.user) {
        setUser(session.user);
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          fetch('/api/auth/profile').then(r => r.json()).then((d: { firstName?: string }) => setFirstName(d.firstName ?? null));
        }
      } else {
        const { data: { session: refreshSession } } = await supabase.auth.refreshSession();
        if (refreshSession?.user) {
          setUser(refreshSession.user);
          fetch('/api/auth/profile').then(r => r.json()).then((d: { firstName?: string }) => setFirstName(d.firstName ?? null));
        }
      }
      setLoading(false);
    };
    
    initAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetch('/api/auth/profile').then(r => r.json()).then((d: { firstName?: string }) => setFirstName(d.firstName ?? null));
      } else {
        setFirstName(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    
    if (isHomePage) {
      // On home page - scroll to element if it exists
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
    } else {
      // Not on home page - navigate to home with anchor
      router.push(`/#${targetId}`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-emerald-500/20 bg-black/60 backdrop-blur-md shadow-lg shadow-emerald-500/5">
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
        }} className="flex items-center gap-2 text-white hover:text-emerald-400 transition-colors">
          <Database className="w-6 h-6 text-emerald-500" />
          <span className="font-bold text-lg tracking-tight">MorphDB</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <Link href="#features" onClick={(e) => handleNavigation(e, 'features')} className="hover:text-emerald-400 transition-colors relative group">
            Features
            <span className="absolute -bottom-6 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 to-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </Link>
          <Link href="#how-it-works" onClick={(e) => handleNavigation(e, 'how-it-works')} className="hover:text-emerald-400 transition-colors relative group">
            How it Works
            <span className="absolute -bottom-6 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 to-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </Link>
          <Link href="/docs" onClick={(e) => {
            e.preventDefault();
            router.push('/docs');
          }} className={`${pathname.startsWith('/docs') ? 'text-emerald-400' : 'hover:text-emerald-400'} transition-colors relative group`}>
            Docs
            <span className={`absolute -bottom-6 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 to-cyan-500 origin-left transition-transform ${pathname.startsWith('/docs') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
          </Link>
          <Link href="#pricing" onClick={(e) => handleNavigation(e, 'pricing')} className="hover:text-emerald-400 transition-colors relative group">
            Pricing
            <span className="absolute -bottom-6 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 to-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </Link>
          <Link href="/support" onClick={(e) => {
            e.preventDefault();
            router.push('/support');
          }} className={`${pathname === '/support' ? 'text-emerald-400' : 'hover:text-emerald-400'} transition-colors relative group`}>
            Support
            <span className={`absolute -bottom-6 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 to-cyan-500 origin-left transition-transform ${pathname === '/support' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="w-20 h-8 bg-emerald-500/10 rounded-full animate-pulse" />
          ) : user ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-400 transition-colors">
                <User className="w-4 h-4" />
                {firstName ?? user.email?.split('@')[0]}
              </Link>
              <Link href="/dashboard" className="group relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-emerald-600/20 border border-emerald-500/30 rounded-full hover:bg-emerald-600/30 hover:shadow-lg hover:shadow-emerald-500/20 transition-all">
                Dashboard <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <form action="/api/auth/signout" method="POST">
                <button type="submit" className="flex items-center gap-1.5 px-3 py-2 text-sm text-zinc-400 hover:text-emerald-400 border border-emerald-500/20 rounded-full hover:bg-emerald-500/10 transition-colors">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-emerald-400 transition-colors">
                Sign In
              </Link>
              <Link href="/waitlist" className="group relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-emerald-600/20 border border-emerald-500/30 rounded-full hover:bg-emerald-600/30 hover:shadow-lg hover:shadow-emerald-500/20 transition-all overflow-hidden">
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
