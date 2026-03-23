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
    <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-1 px-4 py-2 sm:px-6">
        <Link
          href="/"
          className="mr-2 shrink-0 text-sm font-bold tracking-tight text-slate-100 sm:mr-4 sm:text-base"
        >
          {SITE_WORDMARK_LEAD}{' '}
          <span className="text-indigo-400">{SITE_WORDMARK_ACCENT}</span>
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
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-800 text-indigo-400'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
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
