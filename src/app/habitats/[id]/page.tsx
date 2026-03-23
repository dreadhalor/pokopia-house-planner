'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { trpc } from '@/lib/trpc';

export default function HabitatDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: habitat, isLoading } = trpc.habitat.getById.useQuery({ id });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-indigo-400" />
      </div>
    );
  }

  if (!habitat) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950">
        <p className="text-slate-400">Habitat not found.</p>
        <Link href="/habitats" className="text-indigo-400 hover:text-indigo-300 transition">
          &larr; Back to Habitats
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/habitats"
          className="mb-6 inline-flex items-center gap-1 text-sm text-indigo-400 transition hover:text-indigo-300"
        >
          &larr; Back to Habitats
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="mb-2 flex items-center gap-3">
            <span className="font-mono text-sm text-slate-500">{habitat.id}</span>
            {habitat.isEvent && (
              <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                Event
              </span>
            )}
          </div>
          <h1 className="mb-3 text-3xl font-bold text-slate-100">{habitat.name}</h1>
          <p className="max-w-2xl leading-relaxed text-slate-400">{habitat.description}</p>
        </div>

        {/* Pokemon section */}
        <section>
          <h2 className="mb-6 text-xl font-semibold text-slate-100">
            Pokémon Found Here
            {habitat.pokemon.length > 0 && (
              <span className="ml-2 text-base font-normal text-slate-500">
                ({habitat.pokemon.length})
              </span>
            )}
          </h2>

          {habitat.pokemon.length === 0 ? (
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 py-16 text-center">
              <p className="text-slate-500">No Pokémon found for this habitat.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {habitat.pokemon.map((pokemon) => {
                const habitatEntry = pokemon.habitats.find(
                  (h) => h.name === habitat.name
                );

                return (
                  <div
                    key={pokemon.id}
                    className="flex flex-col gap-3 rounded-xl border border-slate-700 bg-slate-800 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                        <Image
                          src={pokemon.sprite}
                          alt={pokemon.name}
                          width={40}
                          height={40}
                          className="object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <span className="w-12 text-right font-mono text-sm text-slate-500">
                        {pokemon.number}
                      </span>
                      <div>
                        <Link
                          href={`/pokemon/${pokemon.id}`}
                          className="font-semibold text-indigo-400 transition hover:text-indigo-300"
                        >
                          {pokemon.name}
                        </Link>
                        <p className="text-sm text-slate-500">{pokemon.location}</p>
                      </div>
                      {pokemon.idealHabitat === habitat.name && (
                        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400">
                          Ideal
                        </span>
                      )}
                    </div>

                    {habitatEntry && (
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-400 sm:text-right">
                        <span>
                          <span className="text-slate-500">Rarity:</span>{' '}
                          <span className="text-slate-300">{habitatEntry.rarity}</span>
                        </span>
                        {habitatEntry.time.length > 0 && (
                          <span>
                            <span className="text-slate-500">Time:</span>{' '}
                            <span className="text-slate-300">
                              {habitatEntry.time.join(', ')}
                            </span>
                          </span>
                        )}
                        {habitatEntry.weather.length > 0 && (
                          <span>
                            <span className="text-slate-500">Weather:</span>{' '}
                            <span className="text-slate-300">
                              {habitatEntry.weather.join(', ')}
                            </span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
