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
  0: 'text-faint',
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
    <div className="rounded-xl border border-edge bg-panel p-5">
      <h3 className="mb-4 text-lg font-semibold text-ink">{title}</h3>
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
            i < score ? 'bg-current' : 'bg-chip'
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
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-edge border-t-accent" />
          <p className="text-muted">Loading Pokémon data…</p>
        </div>
      </div>
    );
  }

  if (!pokemon) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas">
        <p className="text-xl font-semibold text-ink">
          Pokémon not found
        </p>
        <Link
          href="/pokemon"
          className="text-accent-soft underline underline-offset-4 transition-colors hover:text-ink"
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
    <div className="min-h-screen bg-canvas pb-16">
      {/* Header */}
      <header className="border-b border-edge bg-inset/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <Link
            href="/pokemon"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-accent-soft transition-colors hover:text-ink"
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
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-panel/80 ring-1 ring-edge">
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
                <span className="text-2xl font-bold text-faint">
                  {pokemon.number}
                </span>
                <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                  {pokemon.name}
                </h1>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                <Pill className="border-edge-muted bg-chip/60 text-ink-soft">
                  📍 {pokemon.location}
                </Pill>
                <Pill
                  className={
                    HABITAT_COLORS[pokemon.idealHabitat] ??
                    'border-edge-muted bg-chip/60 text-ink-soft'
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
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-faint">
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
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-faint">
                Favorites
              </p>
              <div className="flex flex-wrap gap-1.5">
                {pokemon.favorites.map((fav) => (
                  <Link
                    key={fav}
                    href={`/favorites/${toFavoriteSlug(fav)}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-edge-muted bg-chip/60 px-2.5 py-1 text-xs font-medium text-ink-soft transition-colors hover:border-accent/50 hover:bg-accent/10 hover:text-accent-soft"
                    title={`View all "${fav}" items`}
                  >
                    {fav}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-faint">
                Flavor
              </p>
              <p className="text-sm font-medium text-ink-soft">
                {pokemon.flavor}
              </p>
            </div>
          </Card>

          {/* Card 2: Habitats */}
          <Card title="Habitats">
            {pokemon.habitats.length === 0 ? (
              <p className="text-sm text-faint">
                No habitat data available.
              </p>
            ) : (
              <div className="space-y-4">
                {pokemon.habitats.map((hab) => (
                  <div
                    key={hab.name}
                    className="rounded-lg border border-edge/60 bg-panel/50 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="font-medium text-ink-soft">
                        {hab.name}
                      </span>
                      <Pill
                        className={
                          RARITY_COLORS[hab.rarity] ??
                          'bg-chip text-muted'
                        }
                      >
                        {hab.rarity}
                      </Pill>
                    </div>
                    <div className="mb-2">
                      <p className="mb-1 text-xs text-faint">Areas</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {Object.entries(hab.areas).map(
                          ([area, available]) => (
                            <span
                              key={area}
                              className={`flex items-center gap-1 text-xs ${
                                available
                                  ? 'text-emerald-400'
                                  : 'text-faint'
                              }`}
                            >
                              {available ? '✓' : '✗'} {area}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
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
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-faint">
                Preferred Flavor
              </p>
              <p className="text-sm font-medium text-ink-soft">
                {pokemon.flavor}
              </p>
            </div>

            {foods.length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-faint">
                  Matching Foods
                </p>
                <ul className="space-y-2">
                  {foods.map((food) => (
                    <li
                      key={food.name}
                      className="flex items-center justify-between rounded-md border border-edge/50 bg-panel/40 px-3 py-2"
                    >
                      <div>
                        <span className="text-sm text-ink-soft">
                          {food.name}
                        </span>
                        <span className="ml-2 text-xs text-faint">
                          {food.category}
                        </span>
                      </div>
                      <Pill className="border-accent/30 bg-accent/20 text-accent-soft">
                        {food.move}
                      </Pill>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-faint">
                No food data for this flavor.
              </p>
            )}
          </Card>
        </div>

        {/* Roommates */}
        <section className="mt-10">
          <h2 className="mb-6 text-2xl font-bold text-ink">
            Best Roommates
          </h2>

          {sortedScores.length === 0 ? (
            <p className="text-faint">No roommate data available.</p>
          ) : (
            <div className="space-y-8">
              {sortedScores.map((score) => (
                <div key={score}>
                  <h3
                    className={`mb-3 text-sm font-semibold uppercase tracking-wider ${SCORE_COLORS[score]}`}
                  >
                    {SCORE_LABELS[score] ?? `Score ${score}`} ({score}/5)
                  </h3>

                  <div className="overflow-hidden rounded-xl border border-edge bg-panel">
                    {roommatesByScore[score].map((rm, i) => (
                      <div
                        key={rm.id}
                        className={`flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 ${
                          i > 0 ? 'border-t border-edge/60' : ''
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

                        <span className="w-12 shrink-0 text-sm font-mono text-faint">
                          {rm.number}
                        </span>

                        <Link
                          href={`/pokemon/${rm.id}`}
                          className="min-w-[120px] text-sm font-medium text-accent-soft transition-colors hover:text-ink"
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
                                className="inline-flex items-center rounded-full border border-edge-muted bg-chip/60 px-2 py-0.5 text-xs text-muted transition-colors hover:border-accent/50 hover:text-accent-soft"
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
