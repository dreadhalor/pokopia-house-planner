'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { useDebounce } from '@/hooks/use-debounce';

type Filter = 'all' | 'regular' | 'event';

export default function HabitatsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const debouncedSearch = useDebounce(search, 300);

  const isEvent = filter === 'event' ? true : filter === 'regular' ? false : undefined;

  const { data: habitats, isLoading } = trpc.habitat.search.useQuery({
    query: debouncedSearch,
    isEvent,
  });

  const filters: { label: string; value: Filter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Regular', value: 'regular' },
    { label: 'Event', value: 'event' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold text-slate-100">Habitats</h1>

        {/* Search & Filters */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Search habitats…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <div className="flex gap-1 rounded-lg bg-slate-800 p-1">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                  filter === f.value
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        {habitats && (
          <p className="mb-4 text-sm text-slate-400">
            {habitats.length} habitat{habitats.length !== 1 && 's'} found
          </p>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-indigo-400" />
          </div>
        )}

        {/* Grid */}
        {habitats && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {habitats.map((habitat) => (
              <Link
                key={habitat.id}
                href={`/habitats/${habitat.id}`}
                className="group rounded-xl border border-slate-700 bg-slate-800 p-5 transition hover:border-slate-600 hover:bg-slate-800/80"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-500">
                    {habitat.id}
                  </span>
                  {habitat.isEvent && (
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
                      Event
                    </span>
                  )}
                </div>
                <h2 className="mb-1.5 text-lg font-semibold text-slate-100 group-hover:text-indigo-300 transition">
                  {habitat.name}
                </h2>
                <p className="line-clamp-2 text-sm leading-relaxed text-slate-400">
                  {habitat.description}
                </p>
              </Link>
            ))}
          </div>
        )}

        {/* Empty state */}
        {habitats && habitats.length === 0 && !isLoading && (
          <p className="py-20 text-center text-slate-500">
            No habitats match your search.
          </p>
        )}
      </div>
    </div>
  );
}
