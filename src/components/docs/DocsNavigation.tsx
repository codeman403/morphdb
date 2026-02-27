'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X } from 'lucide-react';

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
      { title: 'API Keys', href: '/docs/get-started/api-keys' },
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
  {
    title: 'API Reference',
    href: '/docs/api-reference',
    children: [
      { title: 'Endpoints', href: '/docs/api-reference/endpoints' },
      { title: 'Authentication', href: '/docs/api-reference/authentication' },
      { title: 'Rate Limiting', href: '/docs/api-reference/rate-limiting' },
    ],
  },
];

interface DocsNavigationProps {
  className?: string;
}

export function DocsNavigation({ className = '' }: DocsNavigationProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <nav className={className}>
      {docNavigation.map((item) => (
        <div key={item.href} className="mb-3">
          <div className="flex items-center">
            <Link
              href={item.href}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                isActive(item.href)
                  ? 'bg-white/5 text-white border-l-2 border-blue-400'
                  : 'text-zinc-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>{item.title}</span>
            </Link>
            {item.children && item.children.length > 0 && (
              <button
                onClick={() => toggleExpanded(item.title)}
                aria-expanded={expandedItems.includes(item.title)}
                className="px-2 py-2 text-zinc-400 hover:text-zinc-200"
              >
                <ChevronDown
                  size={16}
                  className={`transform transition-transform ${
                    expandedItems.includes(item.title) ? 'rotate-180' : ''
                  }`}
                />
              </button>
            )}
          </div>

          {item.children && expandedItems.includes(item.title) && (
            <div className="ml-4 mt-2 space-y-1">
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                    isActive(child.href)
                      ? 'bg-white/5 text-white'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {child.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}

export function MobileDocsNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed bottom-6 right-6 z-40 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-30 bg-[#0a0a0a]/95 backdrop-blur-md border-t border-white/10 overflow-y-auto">
          <div className="p-4">
            <Link 
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-blue-400 hover:text-blue-300 mb-4 pb-4 border-b border-white/10 transition-colors"
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
