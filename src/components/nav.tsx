'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SITE_WORDMARK_ACCENT, SITE_WORDMARK_LEAD } from '@/lib/site';

const links = [
  { href: '/', label: 'Home' },
  { href: '/pokemon', label: 'Pokédex' },
  { href: '/items', label: 'Items' },
  { href: '/habitats', label: 'Habitats' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-edge bg-canvas/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-end gap-1 px-4 py-0 sm:px-6">
        <Link
          href="/"
          className="font-display mr-2 shrink-0 py-2.5 text-sm font-semibold tracking-tight text-ink sm:mr-4 sm:text-base"
        >
          {SITE_WORDMARK_LEAD}{' '}
          <span className="text-warm">{SITE_WORDMARK_ACCENT}</span>
        </Link>

        {links.map((link) => {
          const isActive =
            link.href === '/'
              ? pathname === '/'
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-accent text-ink'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
