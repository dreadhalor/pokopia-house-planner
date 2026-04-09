'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { trpc } from '@/lib/trpc';

function ItemThumb({ src, alt }: { src: string; alt: string }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <span className="flex h-10 w-10 items-center justify-center text-[10px] text-faint">
        —
      </span>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={40}
      height={40}
      className="object-contain"
      onError={() => setErr(true)}
    />
  );
}

export default function FavoriteItemsCategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = trpc.favorites.serebiiCategory.useQuery({ slug });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-edge-muted border-t-accent-soft" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-4">
        <p className="text-muted">Category not found.</p>
        <Link
          href="/favorite-items"
          className="text-accent-soft transition hover:text-ink"
        >
          ← Favorite items (Serebii)
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/favorite-items"
          className="mb-6 inline-flex text-sm text-accent-soft transition hover:text-ink"
        >
          ← All categories
        </Link>

        <header className="mb-8">
          <h1 className="font-display text-3xl font-semibold">{data.name}</h1>
          <p className="mt-2 max-w-2xl text-muted">{data.description}</p>
          <p className="mt-3 text-sm text-faint">
            {data.items.length} items mapped in this app (Serebii lists{' '}
            {data.slugsOnSerebii} icon links on the page).
          </p>
          <a
            href={data.serebiiUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex text-sm font-medium text-accent-soft underline-offset-2 hover:underline"
          >
            Open Serebii page →
          </a>
        </header>

        {data.items.length === 0 ? (
          <div className="rounded-xl border border-edge bg-panel/50 py-16 text-center">
            <p className="text-faint">
              No items resolved yet—run a data build or check Serebii page content.
            </p>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((item) => (
              <li
                key={item.slug}
                className="flex gap-3 rounded-xl border border-edge bg-panel p-3"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-inset">
                  <ItemThumb src={item.image} alt={item.name} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-snug text-ink">{item.name}</p>
                  <p className="mt-0.5 text-xs text-faint">
                    {item.category} · {item.tag}
                  </p>
                  {item.description ? (
                    <p className="mt-1 line-clamp-2 text-xs text-muted">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
