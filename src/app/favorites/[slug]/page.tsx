'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { trpc } from '@/lib/trpc';

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  Decoration: { bg: 'bg-amber-500/20', text: 'text-amber-300' },
  Food: { bg: 'bg-green-500/20', text: 'text-green-300' },
  Relaxation: { bg: 'bg-blue-500/20', text: 'text-blue-300' },
  Road: { bg: 'bg-stone-500/20', text: 'text-stone-300' },
  Toy: { bg: 'bg-pink-500/20', text: 'text-pink-300' },
};

function confidenceTier(score: number): {
  label: string;
  color: string;
  dots: number;
} {
  if (score >= 20) return { label: 'High', color: 'text-emerald-400', dots: 3 };
  if (score >= 10) return { label: 'Medium', color: 'text-amber-400', dots: 2 };
  return { label: 'Low', color: 'text-faint', dots: 1 };
}

function ConfidenceDots({ score }: { score: number }) {
  const { label, color, dots } = confidenceTier(score);
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${color}`} title={`Match confidence: ${label} (${score})`}>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={`inline-block h-1.5 w-1.5 rounded-full ${i <= dots ? 'bg-current' : 'bg-chip'}`}
        />
      ))}
    </span>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-5 w-5 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function ItemImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <svg
        className="h-6 w-6 text-faint"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 11.625l2.25-2.25M12 11.625l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
        />
      </svg>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={40}
      height={40}
      className="object-contain"
      onError={() => setError(true)}
    />
  );
}

export default function FavoriteCategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: category, isLoading } = trpc.favorites.getBySlug.useQuery({
    slug,
  });
  const [itemsOpen, setItemsOpen] = useState(true);
  const [pokemonOpen, setPokemonOpen] = useState(true);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-edge-muted border-t-accent-soft" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas">
        <p className="text-muted">Category not found.</p>
        <Link
          href="/pokemon"
          className="text-accent-soft transition hover:text-ink"
        >
          &larr; Back to Pokédex
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas px-4 py-10 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/pokemon"
          className="mb-6 inline-flex items-center gap-1 text-sm text-accent-soft transition hover:text-ink"
        >
          &larr; Back to Pokédex
        </Link>

        <div className="mb-10">
          <h1 className="font-display mb-3 text-3xl font-semibold text-ink">
            {category.name}
          </h1>
          <p className="max-w-2xl leading-relaxed text-muted">
            {category.description}
          </p>
          <div className="mt-3 flex gap-4 text-sm text-faint">
            <span>{category.itemCount} matching items</span>
            <span>&middot;</span>
            <span>{category.pokemonCount} Pokémon love this</span>
          </div>
        </div>

        {/* Matching Items — first */}
        <section className="mb-10">
          <button
            onClick={() => setItemsOpen(!itemsOpen)}
            className="mb-2 flex w-full cursor-pointer items-center justify-between text-left"
          >
            <h2 className="text-xl font-semibold text-ink">
              Matching Items
              <span className="ml-2 text-base font-normal text-faint">
                ({category.items.length})
              </span>
            </h2>
            <ChevronIcon open={itemsOpen} />
          </button>
          <p className="mb-4 text-sm text-faint">
            Sorted by match confidence (
            <span className="inline-flex items-baseline gap-0.5">
              <span className="inline-block h-1.5 w-1.5 translate-y-[-1px] rounded-full bg-emerald-400" />
              <span className="inline-block h-1.5 w-1.5 translate-y-[-1px] rounded-full bg-emerald-400" />
              <span className="inline-block h-1.5 w-1.5 translate-y-[-1px] rounded-full bg-emerald-400" />
            </span>
            {' '}high &rarr;{' '}
            <span className="inline-flex items-baseline gap-0.5">
              <span className="inline-block h-1.5 w-1.5 translate-y-[-1px] rounded-full bg-faint" />
              <span className="inline-block h-1.5 w-1.5 translate-y-[-1px] rounded-full bg-chip" />
              <span className="inline-block h-1.5 w-1.5 translate-y-[-1px] rounded-full bg-chip" />
            </span>
            {' '}low). Serebii’s favorites pages list which items count for each
            favorite in practice; we treat those as the official reference, even
            though some categories are still incomplete there. This app builds
            this list with keyword rules on item names and descriptions — an
            educated guess that can disagree with Serebii or miss items.
          </p>

          {itemsOpen && (
            <>
              {category.items.length === 0 ? (
                <div className="rounded-xl border border-edge bg-panel/50 py-12 text-center">
                  <p className="text-faint">No matching items found.</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {category.items.map((item) => {
                    const tagStyle = item.tag ? TAG_COLORS[item.tag] : null;
                    const showTag =
                      tagStyle &&
                      item.tag.toLowerCase() !== item.category.toLowerCase();
                    return (
                      <div
                        key={`${item.category}-${item.slug}`}
                        className="flex gap-3 rounded-xl border border-edge bg-panel p-4 transition-colors hover:border-edge-muted"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-chip/50">
                          <ItemImage src={item.image} alt={item.name} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-ink">
                                {item.name}
                              </h3>
                              <ConfidenceDots score={item.confidence} />
                            </div>
                            <div className="flex shrink-0 gap-1.5">
                              {showTag && (
                                <span
                                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${tagStyle.bg} ${tagStyle.text}`}
                                >
                                  {item.tag}
                                </span>
                              )}
                              <span className="rounded-full bg-chip px-2 py-0.5 text-xs text-muted">
                                {item.category}
                              </span>
                            </div>
                          </div>
                          {item.description && (
                            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </section>

        {/* Pokémon Who Love This — second */}
        <section className="mb-10">
          <button
            onClick={() => setPokemonOpen(!pokemonOpen)}
            className="mb-4 flex w-full cursor-pointer items-center justify-between text-left"
          >
            <h2 className="text-xl font-semibold text-ink">
              Pokémon Who Love This
              <span className="ml-2 text-base font-normal text-faint">
                ({category.pokemon.length})
              </span>
            </h2>
            <ChevronIcon open={pokemonOpen} />
          </button>

          {pokemonOpen && (
            <>
              {category.pokemon.length === 0 ? (
                <div className="rounded-xl border border-edge bg-panel/50 py-12 text-center">
                  <p className="text-faint">No Pokémon found.</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {category.pokemon.map((p) => (
                    <Link
                      key={p.id}
                      href={`/pokemon/${p.id}`}
                      className="flex items-center gap-3 rounded-xl border border-edge bg-panel p-4 transition-colors hover:border-edge-muted"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-chip/50">
                        <Image
                          src={p.sprite}
                          alt={p.name}
                          width={40}
                          height={40}
                          className="object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              'none';
                          }}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-faint">
                            {p.number}
                          </span>
                          <span className="font-medium text-accent-soft">
                            {p.name}
                          </span>
                        </div>
                        <p className="text-sm text-faint">
                          {p.idealHabitat}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <div className="mt-4 rounded-lg border border-edge/50 bg-panel/30 p-4">
                <p className="text-sm text-faint">
                  <span className="font-medium text-muted">Note:</span> The
                  game data only includes Pokémon favorites (what they love), not
                  dislikes. There is no known data source for Pokémon preference
                  dislikes.
                </p>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
