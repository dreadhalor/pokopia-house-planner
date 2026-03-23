'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { trpc } from '@/lib/trpc';

const CATEGORIES = [
  'Materials',
  'Food',
  'Furniture',
  'Misc',
  'Outdoor',
  'Utilities',
  'Nature',
  'Buildings',
  'Blocks',
  'Kits',
  'Key Items',
  'Other',
] as const;

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  Decoration: { bg: 'bg-amber-500/20', text: 'text-amber-300' },
  Food: { bg: 'bg-green-500/20', text: 'text-green-300' },
  Relaxation: { bg: 'bg-blue-500/20', text: 'text-blue-300' },
  Road: { bg: 'bg-stone-500/20', text: 'text-stone-300' },
  Toy: { bg: 'bg-pink-500/20', text: 'text-pink-300' },
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

type ItemResult = {
  name: string;
  slug: string;
  description: string;
  tag: string;
  category: string;
  locations: string[];
  image: string;
};

function ItemCard({ item }: { item: ItemResult }) {
  const [imgError, setImgError] = useState(false);
  const tagStyle = item.tag ? TAG_COLORS[item.tag] : null;

  return (
    <div className="flex gap-3 rounded-xl border border-slate-700 bg-slate-800 p-4 transition-colors hover:border-slate-600">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-700/50">
        {imgError ? (
          <svg
            className="h-6 w-6 text-slate-500"
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
        ) : (
          <Image
            src={item.image}
            alt={item.name}
            width={40}
            height={40}
            className="object-contain"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-slate-100">{item.name}</h3>
          <div className="flex shrink-0 gap-1.5">
            {tagStyle && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${tagStyle.bg} ${tagStyle.text}`}
              >
                {item.tag}
              </span>
            )}
            <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-400">
              {item.category}
            </span>
          </div>
        </div>
        {item.description && (
          <p className="mt-1 text-sm leading-relaxed text-slate-400 line-clamp-2">
            {item.description}
          </p>
        )}
        {item.locations.length > 0 && (
          <p className="mt-1 text-xs text-slate-500">
            {item.locations.slice(0, 2).join(' · ')}
            {item.locations.length > 2 &&
              ` +${item.locations.length - 2} more`}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ItemsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data: results = [], isLoading } = trpc.items.search.useQuery({
    query: debouncedSearch || undefined,
    category: category || undefined,
    tag: tag || undefined,
  });

  const { data: categories = [] } = trpc.items.categories.useQuery();
  const { data: tags = [] } = trpc.items.tags.useQuery();

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of categories) {
      map[c.name] = c.count;
    }
    return map;
  }, [categories]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-slate-50">
            Item Encyclopedia
          </h1>
          <p className="mt-2 text-slate-400">
            Browse all {categories.reduce((s, c) => s + c.count, 0)} items
            available in Pokémon Pokopia.
          </p>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search items…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        <div className="mb-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
            Category
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategory('')}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                !category
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              All ({categories.reduce((s, c) => s + c.count, 0)})
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                  category === cat
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {cat} ({categoryCounts[cat] ?? 0})
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
            Tag
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTag('')}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                !tag
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              Any tag
            </button>
            {tags.map((t) => {
              const style = TAG_COLORS[t.name];
              return (
                <button
                  key={t.name}
                  onClick={() => setTag(t.name)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                    tag === t.name
                      ? `${style?.bg ?? 'bg-indigo-500'} ${style?.text ?? 'text-white'} ring-1 ring-current`
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  }`}
                >
                  {t.name} ({t.count})
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-slate-400">
            {isLoading ? (
              'Loading…'
            ) : (
              <>
                <span className="font-semibold text-slate-200">
                  {results.length}
                </span>{' '}
                items found
              </>
            )}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((item) => (
            <ItemCard key={`${item.category}-${item.slug}`} item={item} />
          ))}
        </div>

        {!isLoading && results.length === 0 && (
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 py-16 text-center">
            <p className="text-slate-500">No items match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
