'use client';

import Link from 'next/link';
import { trpc } from '@/lib/trpc';

export default function FavoriteItemsIndexPage() {
  const { data: rows = [], isLoading } = trpc.favorites.serebiiIndex.useQuery();

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10">
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Favorite items (Serebii)
          </h1>
          <p className="mt-3 max-w-2xl text-muted">
            Items listed on{' '}
            <a
              href="https://www.serebii.net/pokemonpokopia/favorites.shtml"
              target="_blank"
              rel="noreferrer"
              className="text-accent-soft underline-offset-2 hover:underline"
            >
              Serebii&apos;s Pokopia favorites pages
            </a>
            , scraped into this app for reference. The town planner uses{' '}
            <strong className="font-medium text-ink-soft">only</strong> these lists
            for furnishing suggestions—not keyword guesses.
          </p>
          <p className="mt-2 text-xs text-faint">
            Rebuild data:{' '}
            <code className="rounded bg-inset px-1 py-0.5 font-mono text-[11px]">
              npm run build:serebii-favorites
            </code>
            . Unmapped Serebii icons show lower &quot;in app&quot; counts until items
            are added to the dataset.
          </p>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-edge-muted border-t-accent-soft" />
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {rows
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((row) => (
                <li key={row.id}>
                  <Link
                    href={`/favorite-items/${row.id}`}
                    className="block rounded-xl border border-edge bg-panel p-4 transition hover:border-accent/40 hover:bg-panel/80"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="font-medium text-ink">{row.name}</h2>
                        <p className="mt-1 line-clamp-2 text-sm text-muted">
                          {row.description}
                        </p>
                      </div>
                      <div className="shrink-0 text-right text-sm tabular-nums text-faint">
                        <div>{row.serebiiItemCount} on Serebii</div>
                        {row.resolvedItemCount !== row.serebiiItemCount && (
                          <div className="text-xs text-faint/80">
                            {row.resolvedItemCount} in app
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
