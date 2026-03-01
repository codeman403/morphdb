'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Database, ChevronRight, User, LogOut, Settings } from 'lucide-react';
import { animate, AnimatePresence, motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

type ScrollNavLink = {
  label: string;
  type: 'scroll';
  id: string;
};

type RouteNavLink = {
  label: string;
  type: 'route';
  href: string;
};

type NavLink = ScrollNavLink | RouteNavLink;

export default function Navbar() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === '/';

  useEffect(() => {
    const supabase = createClient();

    const hydrateProfile = () =>
      fetch('/api/auth/profile')
        .then((r) => r.json())
        .then((data: { firstName?: string }) => setFirstName(data.firstName ?? null))
        .catch(() => setFirstName(null));

    const initAuth = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!error && session?.user) {
        setUser(session.user);
        hydrateProfile();
      } else {
        const {
          data: { session: refreshSession },
        } = await supabase.auth.refreshSession();
        if (refreshSession?.user) {
          setUser(refreshSession.user);
          hydrateProfile();
        }
      }
      setLoading(false);
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _event: AuthChangeEvent = event;
      setUser(session?.user ?? null);
      if (session?.user) {
        hydrateProfile();
      } else {
        setFirstName(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (isHomePage) {
      const target = document.getElementById(targetId);
      if (target) {
        const navbarHeight = 64;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - navbarHeight;

        animate(window.scrollY, offsetPosition, {
          duration: 1.2,
          ease: [0.16, 1, 0.3, 1],
          onUpdate: (latest) => window.scrollTo(0, latest),
        });

        window.history.pushState(null, '', `#${targetId}`);
      }
    } else {
      router.push(`/#${targetId}`);
    }
  };

  const navLinks: NavLink[] = [
    { label: 'Features', type: 'scroll', id: 'features' },
    { label: 'How it Works', type: 'scroll', id: 'how-it-works' },
    { label: 'Docs', type: 'route', href: '/docs' },
    { label: 'Pricing', type: 'scroll', id: 'pricing' },
    { label: 'Support', type: 'route', href: '/support' },
  ];

  const renderDesktopLinks = () => (
    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
      {navLinks.map((link) => {
        const isActiveRoute = link.type === 'route' && pathname.startsWith(link.href);
        return link.type === 'scroll' ? (
          <Link
            key={link.id}
            href={`#${link.id}`}
            onClick={(e) => handleNavigation(e, link.id)}
            className="hover:text-emerald-400 transition-colors relative group"
          >
            {link.label}
            <span className="absolute -bottom-6 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 to-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </Link>
        ) : (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileMenuOpen(false)}
            className={`${isActiveRoute ? 'text-emerald-400' : 'hover:text-emerald-400'} transition-colors relative group`}
          >
            {link.label}
            <span
              className={`absolute -bottom-6 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 to-cyan-500 origin-left transition-transform ${isActiveRoute ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}
            />
          </Link>
        );
      })}
    </div>
  );

  const renderAuthActions = () => (
    <div className="hidden md:flex items-center gap-4">
      {loading ? (
        <div className="w-20 h-8 bg-emerald-500/10 rounded-full animate-pulse" />
      ) : user ? (
        <>
          <Link
            href="/dashboard"
            className="group relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-emerald-600/20 border border-emerald-500/30 rounded-full hover:bg-emerald-600/30 hover:shadow-lg hover:shadow-emerald-500/20 transition-all mr-2"
          >
            Dashboard <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3 border-l border-emerald-500/20 pl-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-400 transition-colors">
              <User className="w-4 h-4" />
              <span className="hidden lg:inline">{firstName ?? user.email?.split('@')[0]}</span>
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-zinc-400 hover:text-emerald-400 border border-emerald-500/20 rounded-full hover:bg-emerald-500/10 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-zinc-400 hover:text-emerald-400 border border-emerald-500/20 rounded-full hover:bg-emerald-500/10 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </>
      ) : (
        <>
          <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-emerald-400 transition-colors">
            Sign In
          </Link>
          <Link
            href="/waitlist"
            className="group relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-emerald-600/20 border border-emerald-500/30 rounded-full hover:bg-emerald-600/30 hover:shadow-lg hover:shadow-emerald-500/20 transition-all overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-1">
              Get Early Access <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        </>
      )}
    </div>
  );

  const renderMobileMenuButton = () => (
    <button
      onClick={() => setMobileMenuOpen((prev) => !prev)}
      className="md:hidden flex items-center justify-center w-10 h-10 text-zinc-400 hover:text-emerald-400 active:text-emerald-300 transition-colors relative pointer-events-auto z-50 touch-manipulation cursor-pointer"
      aria-label="Toggle navigation"
      type="button"
    >
      {mobileMenuOpen ? (
        <span className="text-2xl font-light">×</span>
      ) : (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )}
    </button>
  );

  const renderMobileMenu = () => (
    <AnimatePresence>
      {mobileMenuOpen && (
         <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -20 }}
           transition={{ duration: 0.2 }}
           className="md:hidden fixed inset-0 top-16 bg-slate-950/95 backdrop-blur-xl border-t border-emerald-500/20 z-[45] overflow-y-auto"
         >
        <div className="px-6 py-8 space-y-6">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.type === 'route' ? link.href : `#${link.id}`}
                onClick={(e) => {
                  if (link.type === 'scroll') {
                    handleNavigation(e, link.id);
                  } else {
                    setMobileMenuOpen(false);
                  }
                }}
                className="text-lg font-medium text-zinc-400 hover:text-emerald-400 transition-colors py-2 border-b border-white/5"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-6 space-y-4">
            {!loading && user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-zinc-300 hover:text-emerald-400"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Dashboard ({firstName ?? user.email?.split('@')[0]})</span>
                </Link>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-zinc-300 hover:text-emerald-400"
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Settings</span>
                </Link>
                <form action="/api/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-zinc-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/waitlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-slate-950 bg-emerald-500 rounded-lg hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  Get Early Access <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      setMobileMenuOpen(false);
      animate(window.scrollY, 0, {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (latest) => window.scrollTo(0, latest),
      });
      window.history.pushState(null, '', '/');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-emerald-500/20 bg-slate-950/80 backdrop-blur-md shadow-lg shadow-emerald-500/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" onClick={handleLogoClick} className="flex items-center gap-2 text-white hover:text-emerald-400 transition-colors z-50">
          <Database className="w-6 h-6 text-emerald-500" />
          <span className="font-bold text-lg tracking-tight">MorphDB</span>
        </Link>

        {renderDesktopLinks()}
        {renderAuthActions()}
        {renderMobileMenuButton()}
      </div>

      {renderMobileMenu()}
    </nav>
  );
}
