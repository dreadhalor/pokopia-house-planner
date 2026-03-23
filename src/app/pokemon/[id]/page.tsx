'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { trpc } from '@/lib/trpc';

const FOOD_BY_FLAVOR: Record<
  string,
  { name: string; move: string; category: string }[]
> = {
  Sweet: [
    { name: 'Pecha Berry', move: 'Restore PP', category: 'Berry' },
    { name: 'Leppa salad', move: 'Leafage', category: 'Salad' },
    { name: 'Fluffy bread', move: 'Cut', category: 'Bread' },
    { name: 'Potato hamburger steak', move: 'Rock Smash', category: 'Steak' },
  ],
  Sour: [
    { name: 'Aspear Berry', move: 'Restore PP', category: 'Berry' },
    { name: 'Shredded salad', move: 'Leafage', category: 'Salad' },
    { name: 'Flavorful soup', move: 'Water Gun', category: 'Soup' },
    { name: 'Leppa bread', move: 'Cut', category: 'Bread' },
    { name: 'Tomato hamburger steak', move: 'Rock Smash', category: 'Steak' },
  ],
  Spicy: [
    { name: 'Crouton salad', move: 'Leafage', category: 'Salad' },
    { name: 'Electrifying soup', move: 'Water Gun', category: 'Soup' },
    { name: 'Healthy soup', move: 'Water Gun', category: 'Soup' },
    { name: 'Carrot bread', move: 'Cut', category: 'Bread' },
    { name: 'Bread bowl', move: 'Cut', category: 'Bread' },
  ],
  Bitter: [
    { name: 'Rawst Berry', move: 'Restore PP', category: 'Berry' },
    { name: 'Seaweed salad', move: 'Leafage', category: 'Salad' },
    { name: 'Seaweed soup', move: 'Water Gun', category: 'Soup' },
    { name: 'Recycled bread', move: 'Cut', category: 'Bread' },
    { name: 'Bitter hamburger steak', move: 'Rock Smash', category: 'Steak' },
  ],
  Dry: [
    { name: 'Chesto Berry', move: 'Restore PP', category: 'Berry' },
    { name: 'Crushed-berry salad', move: 'Leafage', category: 'Salad' },
    { name: 'Mushroom soup', move: 'Water Gun', category: 'Soup' },
    { name: 'Mushroom hamburger steak', move: 'Rock Smash', category: 'Steak' },
  ],
};

const HABITAT_COLORS: Record<string, string> = {
  Bright: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Dark: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Cool: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  Dry: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Humid: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Warm: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const RARITY_COLORS: Record<string, string> = {
  Common: 'bg-emerald-500/20 text-emerald-400',
  Rare: 'bg-amber-500/20 text-amber-400',
  'Very Rare': 'bg-red-500/20 text-red-400',
};

const SCORE_COLORS: Record<number, string> = {
  5: 'text-emerald-400',
  4: 'text-lime-400',
  3: 'text-yellow-400',
  2: 'text-orange-400',
  1: 'text-red-400',
  0: 'text-slate-500',
};

const SCORE_LABELS: Record<number, string> = {
  5: 'Perfect Match',
  4: 'Great',
  3: 'Good',
  2: 'Okay',
  1: 'Poor',
  0: 'No Overlap',
};

const SPECIALTY_COLORS = [
  'bg-violet-500/20 text-violet-300 border-violet-500/30',
  'bg-sky-500/20 text-sky-300 border-sky-500/30',
  'bg-rose-500/20 text-rose-300 border-rose-500/30',
  'bg-teal-500/20 text-teal-300 border-teal-500/30',
  'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
  'bg-amber-500/20 text-amber-300 border-amber-500/30',
];

function toFavoriteSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function Pill({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
      <h3 className="mb-4 text-lg font-semibold text-slate-100">{title}</h3>
      {children}
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`h-2 w-5 rounded-full ${
            i < score ? 'bg-current' : 'bg-slate-700'
          }`}
        />
      ))}
    </div>
  );
}

export default function PokemonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: pokemon, isLoading } = trpc.pokemon.getById.useQuery({ id });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500" />
          <p className="text-slate-400">Loading Pokémon data…</p>
        </div>
      </div>
    );
  }

  if (!pokemon) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950">
        <p className="text-xl font-semibold text-slate-100">
          Pokémon not found
        </p>
        <Link
          href="/pokemon"
          className="text-indigo-400 underline underline-offset-4 transition-colors hover:text-indigo-300"
        >
          ← Back to list
        </Link>
      </div>
    );
  }

  const flavorKey =
    pokemon.flavor?.replace(' Flavors', '').replace(' flavors', '') ?? '';
  const foods = FOOD_BY_FLAVOR[flavorKey] ?? [];

  const roommatesByScore = pokemon.roommates.reduce<
    Record<number, typeof pokemon.roommates>
  >((groups, rm) => {
    (groups[rm.score] ??= []).push(rm);
    return groups;
  }, {});
  const sortedScores = Object.keys(roommatesByScore)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-slate-950 pb-16">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <Link
            href="/pokemon"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-indigo-400 transition-colors hover:text-indigo-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Pokémon
          </Link>

          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-3">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-slate-800/80 ring-1 ring-slate-700">
              <Image
                src={pokemon.sprite}
                alt={pokemon.name}
                width={80}
                height={80}
                className="object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-end gap-x-3 gap-y-1">
                <span className="text-2xl font-bold text-slate-500">
                  {pokemon.number}
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 sm:text-4xl">
                  {pokemon.name}
                </h1>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                <Pill className="border-slate-600 bg-slate-700/60 text-slate-300">
                  📍 {pokemon.location}
                </Pill>
                <Pill
                  className={
                    HABITAT_COLORS[pokemon.idealHabitat] ??
                    'border-slate-600 bg-slate-700/60 text-slate-300'
                  }
                >
                  🏠 {pokemon.idealHabitat}
                </Pill>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1: Specialties & Favorites */}
          <Card title="Specialties & Favorites">
            <div className="mb-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                Specialties
              </p>
              <div className="flex flex-wrap gap-1.5">
                {pokemon.specialties.map((s, i) => (
                  <Pill
                    key={s}
                    className={
                      SPECIALTY_COLORS[i % SPECIALTY_COLORS.length]
                    }
                  >
                    {s}
                  </Pill>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                Favorites
              </p>
              <div className="flex flex-wrap gap-1.5">
                {pokemon.favorites.map((fav) => (
                  <Link
                    key={fav}
                    href={`/favorites/${toFavoriteSlug(fav)}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-600 bg-slate-700/60 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-300"
                    title={`View all "${fav}" items`}
                  >
                    {fav}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                Flavor
              </p>
              <p className="text-sm font-medium text-slate-200">
                {pokemon.flavor}
              </p>
            </div>
          </Card>

          {/* Card 2: Habitats */}
          <Card title="Habitats">
            {pokemon.habitats.length === 0 ? (
              <p className="text-sm text-slate-500">
                No habitat data available.
              </p>
            ) : (
              <div className="space-y-4">
                {pokemon.habitats.map((hab) => (
                  <div
                    key={hab.name}
                    className="rounded-lg border border-slate-700/60 bg-slate-800/50 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-200">
                        {hab.name}
                      </span>
                      <Pill
                        className={
                          RARITY_COLORS[hab.rarity] ??
                          'bg-slate-700 text-slate-400'
                        }
                      >
                        {hab.rarity}
                      </Pill>
                    </div>
                    <div className="mb-2">
                      <p className="mb-1 text-xs text-slate-500">Areas</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {Object.entries(hab.areas).map(
                          ([area, available]) => (
                            <span
                              key={area}
                              className={`flex items-center gap-1 text-xs ${
                                available
                                  ? 'text-emerald-400'
                                  : 'text-slate-600'
                              }`}
                            >
                              {available ? '✓' : '✗'} {area}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                      {hab.time.length > 0 && (
                        <span>🕐 {hab.time.join(', ')}</span>
                      )}
                      {hab.weather.length > 0 && (
                        <span>🌤 {hab.weather.join(', ')}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Card 3: Food Preferences */}
          <Card title="Food Preferences">
            <div className="mb-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                Preferred Flavor
              </p>
              <p className="text-sm font-medium text-slate-200">
                {pokemon.flavor}
              </p>
            </div>

            {foods.length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Matching Foods
                </p>
                <ul className="space-y-2">
                  {foods.map((food) => (
                    <li
                      key={food.name}
                      className="flex items-center justify-between rounded-md border border-slate-700/50 bg-slate-800/40 px-3 py-2"
                    >
                      <div>
                        <span className="text-sm text-slate-200">
                          {food.name}
                        </span>
                        <span className="ml-2 text-xs text-slate-500">
                          {food.category}
                        </span>
                      </div>
                      <Pill className="border-indigo-500/30 bg-indigo-500/20 text-indigo-300">
                        {food.move}
                      </Pill>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No food data for this flavor.
              </p>
            )}
          </Card>
        </div>

        {/* Roommates */}
        <section className="mt-10">
          <h2 className="mb-6 text-2xl font-bold text-slate-100">
            Best Roommates
          </h2>

          {sortedScores.length === 0 ? (
            <p className="text-slate-500">No roommate data available.</p>
          ) : (
            <div className="space-y-8">
              {sortedScores.map((score) => (
                <div key={score}>
                  <h3
                    className={`mb-3 text-sm font-semibold uppercase tracking-wider ${SCORE_COLORS[score]}`}
                  >
                    {SCORE_LABELS[score] ?? `Score ${score}`} ({score}/5)
                  </h3>

                  <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
                    {roommatesByScore[score].map((rm, i) => (
                      <div
                        key={rm.id}
                        className={`flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 ${
                          i > 0 ? 'border-t border-slate-700/60' : ''
                        }`}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                          <Image
                            src={rm.sprite}
                            alt={rm.name}
                            width={32}
                            height={32}
                            className="object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                'none';
                            }}
                          />
                        </div>

                        <span className="w-12 shrink-0 text-sm font-mono text-slate-500">
                          {rm.number}
                        </span>

                        <Link
                          href={`/pokemon/${rm.id}`}
                          className="min-w-[120px] text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
                        >
                          {rm.name}
                        </Link>

                        <div
                          className={`flex items-center gap-2 ${SCORE_COLORS[rm.score]}`}
                        >
                          <ScoreBar score={rm.score} />
                          <span className="text-xs font-semibold">
                            {rm.score}/5
                          </span>
                        </div>

                        {rm.sharedFavorites.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {rm.sharedFavorites.map((fav) => (
                              <Link
                                key={fav}
                                href={`/favorites/${toFavoriteSlug(fav)}`}
                                className="inline-flex items-center rounded-full border border-slate-600 bg-slate-700/60 px-2 py-0.5 text-xs text-slate-400 transition-colors hover:border-indigo-500/50 hover:text-indigo-300"
                              >
                                {fav}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
