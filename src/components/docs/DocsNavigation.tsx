'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X, Search } from 'lucide-react';
import { docContentIndex, searchDocumentation } from '@/lib/doc-content-index';

interface NavItem {
  title: string;
  href: string;
  children?: NavItem[];
}

const docNavigation: NavItem[] = [
  {
    title: 'Get Started',
    href: '/docs/get-started',
    children: [
      { title: 'Introduction', href: '/docs/get-started/introduction' },
      { title: 'Quick Start', href: '/docs/get-started/quick-start' },
      { title: 'Authentication', href: '/docs/get-started/authentication' },
    ],
  },
  {
    title: 'Features',
    href: '/docs/features',
    children: [
      { title: 'Soft Delete & Audit Trail', href: '/docs/features/soft-delete' },
      { title: 'Batch Cancellation', href: '/docs/features/batch-cancellation' },
      { title: 'Enhanced Logging', href: '/docs/features/enhanced-logging' },
      { title: 'Security', href: '/docs/features/security' },
    ],
  },
  {
    title: 'Troubleshooting',
    href: '/docs/troubleshooting',
    children: [
      { title: 'Common Issues', href: '/docs/troubleshooting/common-issues' },
      { title: 'FAQ', href: '/docs/troubleshooting/faq' },
      { title: 'Error Codes', href: '/docs/troubleshooting/error-codes' },
      { title: 'Performance', href: '/docs/troubleshooting/performance' },
    ],
  },
  {
    title: 'Changelog',
    href: '/docs/changelog',
  },
  /*
  {
    title: 'API Reference',
    href: '/docs/api-reference',
    children: [
      { title: 'Endpoints', href: '/docs/api-reference/endpoints' },
      { title: 'Authentication', href: '/docs/api-reference/authentication' },
      { title: 'Rate Limiting', href: '/docs/api-reference/rate-limiting' },
    ],
  },
  */
];

interface DocsNavigationProps {
  className?: string;
}

export function DocsNavigation({ className = '' }: DocsNavigationProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const filteredNavigation = useMemo(() => {
    if (!searchQuery.trim()) return docNavigation;
    
    const lowerQuery = searchQuery.toLowerCase();
    // Get all matching doc slugs from content search
    const matchingSlugs = searchDocumentation(searchQuery);
    const matchingHrefs = new Set(
      matchingSlugs.map(slug => `/docs/${slug}`)
    );

    return docNavigation.map(section => {
      // If section title matches, return the whole section
      if (section.title.toLowerCase().includes(lowerQuery)) {
        return section;
      }
      
      // Filter children by both title and content
      if (section.children) {
        const matchingChildren = section.children.filter(child => 
          child.title.toLowerCase().includes(lowerQuery) || 
          matchingHrefs.has(child.href)
        );
        if (matchingChildren.length > 0) {
          return { ...section, children: matchingChildren };
        }
      }
      return null;
    }).filter(Boolean) as NavItem[];
  }, [searchQuery]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Search docs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search documentation"
          className="w-full bg-slate-900/50 border border-emerald-500/20 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
        />
      </div>

      <nav className={className}>
        {filteredNavigation.map((item) => {
          const isExpanded = expandedItems.includes(item.title) || hoveredItem === item.title || (searchQuery.trim().length > 0 && !!item.children);

          return (
            <div 
              key={item.href} 
              className="mb-3"
              onMouseEnter={() => setHoveredItem(item.title)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="flex items-center">
                <Link
                  href={item.href}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                    isActive(item.href)
                      ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500'
                      : 'text-zinc-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>{item.title}</span>
                </Link>
                {item.children && item.children.length > 0 && (
                  <button
                    onClick={() => toggleExpanded(item.title)}
                    aria-expanded={isExpanded}
                    aria-label={isExpanded ? `Collapse ${item.title} section` : `Expand ${item.title} section`}
                    className="px-2 py-2 text-zinc-400 hover:text-zinc-200"
                  >
                    <ChevronDown
                      size={16}
                      aria-hidden="true"
                      className={`transform transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                )}
              </div>

              {item.children && isExpanded && (
                <div className="ml-4 mt-2 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                        isActive(child.href)
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {child.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

export function MobileDocsNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed bottom-6 right-6 z-40 p-3 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700"
        aria-label={isOpen ? "Close documentation menu" : "Open documentation menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-docs-menu"
      >
        {isOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
      </button>

      {isOpen && (
        <div id="mobile-docs-menu" className="md:hidden fixed inset-0 top-16 z-30 bg-[#0a0a0a]/95 backdrop-blur-md border-t border-white/10 overflow-y-auto">
          <div className="p-4">
            <Link 
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-emerald-400 hover:text-emerald-300 mb-4 pb-4 border-b border-white/10 transition-colors"
            >
              ← Back to Home
            </Link>
            <DocsNavigation className="space-y-2" />
          </div>
        </div>
      )}
    </>
  );
}
