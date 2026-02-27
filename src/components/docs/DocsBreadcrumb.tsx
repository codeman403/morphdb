'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function DocsBreadcrumb() {
  const pathname = usePathname();

  // Extract segments from pathname (e.g., "/docs/get-started/introduction" -> ["docs", "get-started", "introduction"])
  const segments = pathname.split('/').filter(Boolean);

  // Don't show breadcrumb on /docs home page
  if (segments.length === 1) {
    return null;
  }

  // Create breadcrumb items
  const breadcrumbs = segments.map((segment, index) => {
    // Format the segment: convert kebab-case to Title Case
    const label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Build the href for this breadcrumb
    const href = '/' + segments.slice(0, index + 1).join('/');

    // The last segment should not be a link
    const isLast = index === segments.length - 1;

    return { label, href, isLast };
  });

  return (
    <nav className="flex items-center gap-2 text-sm text-zinc-400 mb-6 pb-4 border-b border-white/10">
      <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors">
        Home
      </Link>
      <span className="text-zinc-600">/</span>
      {breadcrumbs.map((crumb) => (
        <div key={crumb.href} className="flex items-center gap-2">
          {crumb.isLast ? (
            <span className="text-white">{crumb.label}</span>
          ) : (
            <>
              <Link href={crumb.href} className="text-blue-400 hover:text-blue-300 transition-colors">
                {crumb.label}
              </Link>
              <span className="text-zinc-600">/</span>
            </>
          )}
        </div>
      ))}
    </nav>
  );
}
