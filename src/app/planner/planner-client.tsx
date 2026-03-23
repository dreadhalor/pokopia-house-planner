'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { trpc } from '@/lib/trpc';
import { useTownsStore, MAX_TOWNS } from '@/stores/towns-store';
import type { SuggestedHouseItem } from '@/server/housing';

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function scoreColor(score: number) {
  if (score > 70) return 'text-green-500';
  if (score >= 40) return 'text-amber-500';
  return 'text-red-500';
}

function scoreBg(score: number) {
  if (score > 70) return 'bg-green-500/10 ring-green-500/30';
  if (score >= 40) return 'bg-amber-500/10 ring-amber-500/30';
  return 'bg-red-500/10 ring-red-500/30';
}

type GridMon = { id: string; name: string; sprite: string };

function HouseBedGrid({
  capacity,
  pokemon,
  size = 'md',
  /** One row of beds (map thumbnails) so 4-bed houses are not clipped vertically. */
  compactRow = false,
}: {
  capacity: number;
  pokemon: GridMon[];
  size?: 'xs' | 'sm' | 'md';
  compactRow?: boolean;
}) {
  const img =
    size === 'xs'
      ? compactRow && capacity >= 4
        ? 14
        : 18
      : size === 'sm'
        ? 26
        : 36;
  const cells: (GridMon | null)[] = [];
  for (let i = 0; i < capacity; i++) {
    cells.push(pokemon[i] ?? null);
  }
  const gridCols =
    compactRow && capacity >= 4
      ? 'grid-cols-4'
      : capacity === 4 && !compactRow
        ? 'grid-cols-2'
        : 'grid-cols-2';
  return (
    <div
      className={`grid gap-px sm:gap-0.5 ${gridCols}`}
      aria-hidden
    >
      {cells.map((mon, i) => (
        <div
          key={i}
          className={`flex min-w-0 items-center justify-center rounded border border-edge-muted/70 bg-canvas/90 ${
            compactRow && capacity >= 4
              ? 'aspect-square min-h-[14px]'
              : `aspect-square ${size === 'xs' ? 'min-h-5 sm:min-h-6' : 'min-h-7 sm:min-h-9'}`
          }`}
        >
          {mon ? (
            <Image
              src={mon.sprite}
              alt=""
              width={img}
              height={img}
              className="object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <span
              className={`select-none text-faint ${
                size === 'xs'
                  ? 'text-[7px] leading-none'
                  : 'text-[9px] sm:text-[10px]'
              }`}
            >
              empty
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 text-faint transition-transform ${open ? 'rotate-180' : ''}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function FurnishingItemRow({
  item,
  rank,
}: {
  item: SuggestedHouseItem;
  rank: number;
}) {
  const onSerebii = item.serebiiDocumentedFavorites.length > 0;
  const serebiiTitle = onSerebii
    ? `On Serebii’s list for: ${item.serebiiDocumentedFavorites.join(', ')}`
    : 'Not on Serebii’s lists for this house’s favorites — keyword match only';
  return (
    <li className="flex gap-3 rounded-lg border border-edge/80 bg-inset/40 p-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-panel text-xs font-bold text-faint">
        {rank}
      </span>
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-panel">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-contain p-0.5"
          sizes="48px"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="font-medium leading-tight text-ink">
            {item.name}
          </span>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${
              onSerebii
                ? 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/35'
                : 'bg-chip/50 text-muted ring-edge-muted'
            }`}
            title={serebiiTitle}
          >
            {onSerebii ? 'Serebii list' : 'Keyword guess'}
          </span>
          <span className="text-[10px] text-faint">
            {item.category} · {item.tag}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-faint">
          <span>
            appeal{' '}
            <span className="tabular-nums text-muted">
              {item.totalAppeal}
            </span>
          </span>
          <span>
            spread{' '}
            <span className="tabular-nums text-muted">
              {item.disagreement}
            </span>
          </span>
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          {item.perPokemon.map((pp) => (
            <span
              key={pp.id}
              className="rounded px-1 py-0.5 text-[9px] text-faint"
              title={pp.name}
            >
              {pp.name.split(' ')[0]}:{' '}
              <span className="tabular-nums text-muted">{pp.score}</span>
            </span>
          ))}
        </div>
      </div>
    </li>
  );
}

export default function PlannerPage() {
  const [storeReady, setStoreReady] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [newTownName, setNewTownName] = useState('');
  const [showNewTown, setShowNewTown] = useState(false);
  const [showRenameTown, setShowRenameTown] = useState(false);
  const [renameDraft, setRenameDraft] = useState('');
  const [partitionArgs, setPartitionArgs] = useState<{
    pokemonIds: string[];
    housesOf2: number;
    housesOf4: number;
    deepOptimize: boolean;
  } | null>(null);
  const [deepOptimize, setDeepOptimize] = useState(false);
  const [setupDetailsOpen, setSetupDetailsOpen] = useState(true);
  const [houseDetailsOpen, setHouseDetailsOpen] = useState<
    Record<number, boolean>
  >({});
  const [showFurnishingIdeas, setShowFurnishingIdeas] = useState(false);
  const [heuristicFurnishingOpen, setHeuristicFurnishingOpen] = useState<
    Record<number, boolean>
  >({});
  const lastPlanKeyRef = useRef<string | null>(null);
  const houseSectionRefs = useRef<Partial<Record<number, HTMLElement>>>({});

  const towns = useTownsStore((s) => s.towns);
  const activeTownId = useTownsStore((s) => s.activeTownId);
  const activeTown = useMemo(
    () => towns.find((t) => t.id === activeTownId),
    [towns, activeTownId],
  );
  const addTown = useTownsStore((s) => s.addTown);
  const deleteTown = useTownsStore((s) => s.deleteTown);
  const renameTown = useTownsStore((s) => s.renameTown);
  const setActiveTownId = useTownsStore((s) => s.setActiveTownId);
  const updateActivePokemonIds = useTownsStore((s) => s.updateActivePokemonIds);
  const setActiveHouses = useTownsStore((s) => s.setActiveHouses);

  const selectedIds = activeTown?.pokemonIds ?? [];
  const housesOf2 = activeTown?.housesOf2 ?? 0;
  const housesOf4 = activeTown?.housesOf4 ?? 1;

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const done = () => {
      useTownsStore.getState().ensureDefaultTown();
      setStoreReady(true);
    };
    const r = useTownsStore.persist.rehydrate();
    void Promise.resolve(r).then(done);
  }, []);
  const debouncedQuery = useDebounce(searchText, 300);

  const searchResult = trpc.pokemon.search.useQuery(
    { query: debouncedQuery },
    { enabled: debouncedQuery.length > 0 },
  );

  const fullDex = trpc.pokemon.search.useQuery(
    { query: '' },
    { staleTime: 5 * 60_000 },
  );

  const partition = trpc.planner.partitionTown.useQuery(partitionArgs!, {
    enabled: partitionArgs !== null,
  });

  const analysis = trpc.planner.analyze.useQuery(
    { pokemonIds: selectedIds },
    { enabled: selectedIds.length > 0 && selectedIds.length <= 4 },
  );

  const recommendations = trpc.planner.recommend.useQuery(
    { pokemonIds: selectedIds },
    { enabled: selectedIds.length > 0 && selectedIds.length < 4 },
  );

  const totalSlots = housesOf2 * 2 + housesOf4 * 4;
  const canSuggestHousing =
    selectedIds.length > 0 && totalSlots >= selectedIds.length;

  const filteredResults = (searchResult.data ?? []).filter(
    (p) => !selectedIds.includes(p.id),
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function addPokemon(id: string) {
    if (selectedIds.length >= 48 || selectedIds.includes(id)) return;
    updateActivePokemonIds((prev) => [...prev, id]);
    setSearchText('');
    setDropdownOpen(false);
  }

  function removePokemon(id: string) {
    updateActivePokemonIds((prev) => prev.filter((i) => i !== id));
  }

  function handleSwitchTown(id: string) {
    setPartitionArgs(null);
    setShowRenameTown(false);
    setActiveTownId(id);
  }

  function handleCreateTown(e: React.FormEvent) {
    e.preventDefault();
    const name = newTownName.trim() || 'New town';
    addTown(name);
    setNewTownName('');
    setShowNewTown(false);
    setShowRenameTown(false);
    setPartitionArgs(null);
  }

  function handleSubmitRename(e: React.FormEvent) {
    e.preventDefault();
    if (!activeTown) return;
    const n = renameDraft.trim();
    if (!n) return;
    renameTown(activeTown.id, n);
    setShowRenameTown(false);
  }

  function handleDeleteTown() {
    if (!activeTownId || towns.length <= 1) return;
    if (
      !confirm(
        `Delete “${activeTown?.name ?? 'this town'}”? This cannot be undone.`,
      )
    ) {
      return;
    }
    setPartitionArgs(null);
    deleteTown(activeTownId);
  }

  const townsSorted = useMemo(
    () => [...towns].sort((a, b) => a.name.localeCompare(b.name)),
    [towns],
  );

  const idToMon = useMemo(() => {
    const m = new Map<string, NonNullable<typeof fullDex.data>[number]>();
    for (const p of fullDex.data ?? []) {
      m.set(p.id, p);
    }
    return m;
  }, [fullDex.data]);

  function runPartition() {
    if (!canSuggestHousing) return;
    setPartitionArgs({
      pokemonIds: [...selectedIds],
      housesOf2,
      housesOf4,
      deepOptimize,
    });
  }

  const partData = partition.data;
  const partitionError =
    partData && 'ok' in partData && partData.ok === false
      ? partData.error
      : partition.error?.message;

  const partitionStale =
    partitionArgs != null &&
    (partitionArgs.housesOf2 !== housesOf2 ||
      partitionArgs.housesOf4 !== housesOf4 ||
      partitionArgs.deepOptimize !== deepOptimize ||
      (() => {
        if (partitionArgs.pokemonIds.length !== selectedIds.length) {
          return true;
        }
        const a = new Set(partitionArgs.pokemonIds);
        return (
          a.size !== selectedIds.length ||
          selectedIds.some((id) => !a.has(id))
        );
      })());

  const data = analysis.data;
  const recs = recommendations.data;

  const planOk = partData && 'ok' in partData && partData.ok ? partData : null;
  const planKey =
    planOk && partitionArgs
      ? `${partitionArgs.pokemonIds.join(',')}|${partitionArgs.housesOf2}|${partitionArgs.housesOf4}|${partitionArgs.deepOptimize}|${planOk.houses.length}`
      : null;

  useEffect(() => {
    if (!planKey) return;
    if (planKey === lastPlanKeyRef.current) return;
    lastPlanKeyRef.current = planKey;
    setSetupDetailsOpen(false);
    setHouseDetailsOpen({});
    setShowFurnishingIdeas(false);
  }, [planKey]);

  function toggleHouseDetail(index: number) {
    setHouseDetailsOpen((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  }

  /** From town overview: open house and bring it into view (does not collapse). */
  function goToHouse(index: number) {
    setHouseDetailsOpen((prev) => ({ ...prev, [index]: true }));
    queueMicrotask(() => {
      houseSectionRefs.current[index]?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }

  function expandAllHouses() {
    if (!planOk) return;
    const next: Record<number, boolean> = {};
    for (const h of planOk.houses) {
      next[h.index] = true;
    }
    setHouseDetailsOpen(next);
  }

  function collapseAllHouses() {
    setHouseDetailsOpen({});
  }

  if (!storeReady || !activeTown) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-muted">
        Loading saved towns…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas px-4 py-12 text-ink">
      <div className="mx-auto max-w-4xl space-y-10">
        <header className="space-y-2">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Town &amp; roommate planner
          </h1>
          <p className="max-w-2xl text-muted">
            Add every Pok&eacute;mon in your town, choose how many 2- and 4-slot
            houses you have, then get a suggested split that keeps habitat types
            separate and lines up favorites. Each house can list ranked item
            ideas (Serebii-backed where we have data, plus keyword guesses) with a
            fairness penalty when one roommate scores much higher than others.
          </p>
          <p className="text-xs text-faint">
            Towns are saved in this browser (localStorage). Up to {MAX_TOWNS}{' '}
            towns; clearing site data removes them. Not synced to a server.
          </p>
        </header>

        {/* Saved towns */}
        <section className="rounded-xl border border-edge bg-panel/80 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <label className="flex min-w-48 flex-1 flex-col gap-1">
              <span className="text-xs font-medium text-muted">
                Active town
              </span>
              <select
                value={activeTownId ?? ''}
                onChange={(e) => handleSwitchTown(e.target.value)}
                className="rounded-lg border border-edge-muted bg-inset px-3 py-2 text-sm text-ink"
              >
                {townsSorted.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.pokemonIds.length} mons)
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {!showNewTown ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowRenameTown(false);
                    setShowNewTown(true);
                  }}
                  disabled={towns.length >= MAX_TOWNS}
                  className="rounded-lg border border-edge-muted bg-inset px-3 py-2 text-sm font-medium text-ink-soft hover:bg-panel disabled:cursor-not-allowed disabled:opacity-40"
                >
                  New town
                </button>
              ) : (
                <form
                  onSubmit={handleCreateTown}
                  className="flex flex-wrap items-center gap-2"
                >
                  <input
                    value={newTownName}
                    onChange={(e) => setNewTownName(e.target.value)}
                    placeholder="Town name"
                    className="w-40 rounded-lg border border-edge-muted bg-inset px-3 py-2 text-sm"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-cta px-3 py-2 text-sm font-medium text-white hover:bg-cta-hover"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewTown(false);
                      setNewTownName('');
                    }}
                    className="rounded-lg px-3 py-2 text-sm text-muted hover:text-ink-soft"
                  >
                    Cancel
                  </button>
                </form>
              )}
              {!showRenameTown ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!activeTown) return;
                    setShowNewTown(false);
                    setRenameDraft(activeTown.name);
                    setShowRenameTown(true);
                  }}
                  className="rounded-lg border border-edge-muted bg-inset px-3 py-2 text-sm font-medium text-ink-soft hover:bg-panel"
                >
                  Rename
                </button>
              ) : (
                <form
                  onSubmit={handleSubmitRename}
                  className="flex flex-wrap items-center gap-2"
                >
                  <label className="sr-only" htmlFor="rename-town-input">
                    New town name
                  </label>
                  <input
                    id="rename-town-input"
                    value={renameDraft}
                    onChange={(e) => setRenameDraft(e.target.value)}
                    className="w-44 rounded-lg border border-edge-muted bg-inset px-3 py-2 text-sm text-ink sm:w-52"
                    autoFocus
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-cta px-3 py-2 text-sm font-medium text-white hover:bg-cta-hover"
                  >
                    Save name
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRenameTown(false)}
                    className="rounded-lg px-3 py-2 text-sm text-muted hover:text-ink-soft"
                  >
                    Cancel
                  </button>
                </form>
              )}
              <button
                type="button"
                onClick={handleDeleteTown}
                disabled={towns.length <= 1}
                className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm font-medium text-red-300 hover:bg-red-950/50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Delete
              </button>
            </div>
          </div>
        </section>

        {/* Roster + layout (collapsible when you have a plan) */}
        <details
          className="rounded-xl border border-edge bg-panel"
          open={setupDetailsOpen}
          onToggle={(e) => setSetupDetailsOpen(e.currentTarget.open)}
        >
          <summary className="cursor-pointer list-none px-5 py-4 marker:hidden [&::-webkit-details-marker]:hidden">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-ink">
                  Town roster &amp; house layout
                </h2>
                <p className="mt-0.5 text-xs text-faint">
                  Add Pok&eacute;mon and bed counts. Collapse this to focus on
                  the plan below.
                </p>
              </div>
              <Chevron open={setupDetailsOpen} />
            </div>
          </summary>
          <div className="space-y-10 border-t border-edge px-5 pb-5 pt-6">
        {/* Town roster */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-ink-soft">Your town</h3>
            <span className="text-sm text-muted">
              {selectedIds.length} Pok&eacute;mon
              {selectedIds.length >= 48 ? ' (max)' : ''}
            </span>
          </div>

          <div ref={wrapperRef} className="relative">
            <input
              type="text"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setDropdownOpen(true);
              }}
              onFocus={() => {
                if (searchText.length > 0) setDropdownOpen(true);
              }}
              placeholder="Search by name to add…"
              className="w-full rounded-lg border border-edge-muted bg-inset px-4 py-2.5 text-sm text-ink placeholder-faint outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
            />

            {dropdownOpen && filteredResults.length > 0 && (
              <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-edge bg-panel py-1 shadow-lg">
                {filteredResults.slice(0, 20).map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => addPokemon(p.id)}
                      disabled={selectedIds.length >= 48}
                      className="flex w-full cursor-pointer items-center gap-3 px-4 py-2 text-left text-sm transition hover:bg-chip disabled:opacity-40"
                    >
                      <span className="font-mono text-xs text-faint">
                        {p.number}
                      </span>
                      <span>{p.name}</span>
                      <span className="ml-auto text-xs text-faint">
                        {p.idealHabitat}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selectedIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedIds.map((id) => {
                const fromPartition =
                  partData && 'ok' in partData && partData.ok
                    ? partData.houses
                        .flatMap((h) => h.pokemon)
                        .find((mon) => mon.id === id)
                    : undefined;
                const p = idToMon.get(id) ?? fromPartition;
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-chip px-3 py-1.5 text-sm"
                  >
                    {p ? (
                      <Image
                        src={p.sprite}
                        alt={p.name}
                        width={24}
                        height={24}
                        className="object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : null}
                    <span className="font-mono text-xs text-muted">
                      {p?.number ?? '…'}
                    </span>
                    {p?.name ?? 'Loading…'}
                    <button
                      type="button"
                      onClick={() => removePokemon(id)}
                      className="ml-1 cursor-pointer rounded p-0.5 text-muted transition hover:bg-edge-muted hover:text-ink-soft"
                      aria-label="Remove"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="h-3.5 w-3.5"
                      >
                        <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                      </svg>
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </section>

        {/* House counts */}
        <section className="space-y-4 rounded-xl border border-edge bg-inset/40 p-5">
          <h3 className="text-base font-semibold text-ink-soft">House layout</h3>
          <p className="text-sm text-muted">
            Pokopia allows up to four Pok&eacute;mon per house, with matching
            habitat type inside each home. You can list more beds than
            Pok&eacute;mon — extra houses stay vacant and partly-filled houses
            show open slots.
          </p>
          <div className="flex flex-wrap gap-6">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted">
                2-Pok&eacute;mon houses
              </span>
              <input
                type="number"
                min={0}
                max={24}
                value={housesOf2}
                onChange={(e) =>
                  setActiveHouses(
                    Math.max(0, Math.min(24, +e.target.value || 0)),
                    housesOf4,
                  )
                }
                className="w-28 rounded-lg border border-edge-muted bg-inset px-3 py-2 text-sm tabular-nums"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted">
                4-Pok&eacute;mon houses
              </span>
              <input
                type="number"
                min={0}
                max={24}
                value={housesOf4}
                onChange={(e) =>
                  setActiveHouses(
                    housesOf2,
                    Math.max(0, Math.min(24, +e.target.value || 0)),
                  )
                }
                className="w-28 rounded-lg border border-edge-muted bg-inset px-3 py-2 text-sm tabular-nums"
              />
            </label>
          </div>
          <div
            className={`rounded-lg px-3 py-2 text-sm ${
              canSuggestHousing
                ? 'bg-emerald-500/10 text-emerald-300'
                : 'bg-inset text-muted'
            }`}
          >
            <span className="font-medium tabular-nums">{totalSlots}</span> total
            slots &middot;{' '}
            <span className="font-medium tabular-nums">
              {selectedIds.length}
            </span>{' '}
            Pok&eacute;mon
            {selectedIds.length > 0 && totalSlots < selectedIds.length && (
              <span className="text-amber-400">
                {' '}
                — add houses or beds so slots are at least your town size.
              </span>
            )}
            {selectedIds.length > 0 && totalSlots > selectedIds.length && (
              <span className="text-faint">
                {' '}
                ({totalSlots - selectedIds.length} spare bed
                {totalSlots - selectedIds.length === 1 ? '' : 's'})
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={runPartition}
              disabled={!canSuggestHousing || partition.isFetching}
              className="rounded-lg bg-cta px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cta-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              {partition.isFetching
                ? deepOptimize
                  ? 'Optimizing…'
                  : 'Computing…'
                : 'Suggest housing'}
            </button>
            <label className="flex max-w-lg cursor-pointer items-start gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={deepOptimize}
                onChange={(e) => setDeepOptimize(e.target.checked)}
                disabled={partition.isFetching}
                className="mt-0.5 rounded border-edge-muted"
              />
              <span>
                <span className="font-medium text-ink-soft">
                  Deeper optimization
                </span>
                <span className="block text-xs text-faint">
                  After the initial plan, try same-habitat swaps and moves to
                  raise total favorite-overlap scores. Slower on large towns;
                  turn off if the page feels stuck.
                </span>
              </span>
            </label>
          </div>
        </section>
          </div>
        </details>

        {/* Partition errors */}
        {partitionArgs && partitionError && (
          <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {partitionError}
          </div>
        )}

        {/* Partition results */}
        {partitionStale &&
          partData &&
          'ok' in partData &&
          partData.ok && (
            <p className="text-center text-sm text-amber-400/90">
              Town or house counts changed since this plan — run &ldquo;Suggest
              housing&rdquo; again to refresh.
            </p>
          )}

        {planOk && (
          <section className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-edge bg-panel/80 p-5">
              <div>
                <h2 className="text-lg font-semibold">Suggested plan</h2>
                <p className="mt-1 text-sm text-muted">
                  Sum of house compatibility scores:{' '}
                  <span className="font-semibold text-ink-soft tabular-nums">
                    {planOk.sumHouseCompatibility}
                  </span>
                  <span className="text-faint"> · </span>
                  Average (occupied houses):{' '}
                  <span className="font-semibold text-ink-soft tabular-nums">
                    {planOk.averageHouseCompatibility}%
                  </span>
                </p>
                <p className="mt-2 max-w-2xl text-xs text-faint">
                  A low score does not mean you ran out of houses. It means
                  little overlap in the first five favorites between roommates.
                  The default fill is fast; enable{' '}
                  <span className="text-muted">Deeper optimization</span>{' '}
                  before running again to search same-habitat swaps and moves
                  that raise the total (not guaranteed to fix every house).
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={expandAllHouses}
                  className="rounded-lg border border-edge-muted bg-inset px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-panel"
                >
                  Expand all houses
                </button>
                <button
                  type="button"
                  onClick={collapseAllHouses}
                  className="rounded-lg border border-edge-muted bg-inset px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-panel"
                >
                  Collapse all
                </button>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-edge-muted bg-inset px-3 py-1.5 text-xs text-ink-soft hover:bg-panel">
                  <input
                    type="checkbox"
                    checked={showFurnishingIdeas}
                    onChange={(e) => setShowFurnishingIdeas(e.target.checked)}
                    className="rounded border-edge-muted"
                  />
                  Show furnishing lists
                </label>
              </div>
            </div>

            <div
              className="rounded-xl border border-edge bg-inset/40 p-4"
              title="Scroll sideways. Tap a plot to open that house and scroll to it. Percent = overlap of each Pokémon’s first five favorites between roommates (0% = no overlap; same habitat still required)."
            >
              <div className="flex flex-wrap items-end justify-between gap-2">
                <h2 className="text-sm font-semibold text-ink-soft">
                  Town overview
                </h2>
                <p className="max-w-lg text-[11px] leading-snug text-faint">
                  Tap a plot to jump to that house. % = favorite overlap (top
                  five).
                </p>
              </div>
              <div className="relative mt-3">
                <div
                  className="flex flex-nowrap items-start gap-2 overflow-x-auto overflow-y-visible pb-1 [scrollbar-width:thin]"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  {planOk.houses.map((house, hi) => {
                    const open = !!houseDetailsOpen[house.index];
                    return (
                      <button
                        key={house.index}
                        type="button"
                        aria-label={`Open house ${hi + 1}: ${house.idealHabitat === 'Vacant' ? 'vacant' : house.idealHabitat}, ${house.pokemon.length} Pokémon`}
                        onClick={() => goToHouse(house.index)}
                        className={`w-[4.75rem] shrink-0 rounded-md border px-1.5 py-1 text-left transition sm:w-[5.25rem] ${
                          open
                            ? 'border-accent/50 bg-accent/10 ring-1 ring-accent/20'
                            : 'border-edge bg-inset/90 hover:border-edge-muted'
                        }`}
                      >
                        <div className="text-[9px] font-medium uppercase tracking-wide text-faint">
                          H{hi + 1}
                        </div>
                        <div className="line-clamp-2 min-h-[1.75rem] text-[10px] leading-tight text-muted">
                          {house.idealHabitat === 'Vacant'
                            ? 'Vacant'
                            : house.idealHabitat}
                          {house.pokemon.length > 0 && (
                            <span
                              title="Favorite overlap in top 5 (per pair average)"
                              className={`ml-0.5 tabular-nums ${scoreColor(house.compatibilityScore)}`}
                            >
                              {house.compatibilityScore}%
                            </span>
                          )}
                        </div>
                        <div className="mt-1 w-full">
                          <HouseBedGrid
                            capacity={house.capacity}
                            pokemon={house.pokemon}
                            size="xs"
                            compactRow
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p
                  className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-linear-to-l from-inset/95 to-transparent"
                  aria-hidden
                />
              </div>
            </div>

            <div className="space-y-3">
              {planOk.houses.map((house, hi) => {
                const open = !!houseDetailsOpen[house.index];
                return (
                  <article
                    key={house.index}
                    id={`planner-house-${house.index}`}
                    ref={(el) => {
                      if (el) {
                        houseSectionRefs.current[house.index] = el;
                      } else {
                        delete houseSectionRefs.current[house.index];
                      }
                    }}
                    className="scroll-mt-4 rounded-xl border border-edge bg-panel"
                  >
                    <button
                      type="button"
                      onClick={() => toggleHouseDetail(house.index)}
                      className="flex w-full items-start gap-3 border-b border-edge bg-inset/50 px-4 py-3 text-left transition hover:bg-inset/80 sm:items-center sm:gap-4 sm:px-5"
                    >
                      <div className="hidden w-18 shrink-0 sm:block">
                        <HouseBedGrid
                          capacity={house.capacity}
                          pokemon={house.pokemon}
                          size="sm"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-ink">
                          House {hi + 1}
                          <span className="ml-2 text-sm font-normal text-faint">
                            {house.capacity} beds ·{' '}
                            {house.idealHabitat === 'Vacant'
                              ? 'vacant'
                              : house.idealHabitat}
                          </span>
                        </h3>
                        {house.pokemon.length === 0 ? (
                          <p className="mt-0.5 text-xs text-faint">
                            Empty house
                          </p>
                        ) : (
                          <p className="mt-0.5 text-xs text-faint">
                            {house.pokemon.length}/{house.capacity} beds ·
                            compatibility{' '}
                            <span
                              className={`font-semibold tabular-nums ${scoreColor(house.compatibilityScore)}`}
                            >
                              {house.compatibilityScore}%
                            </span>
                          </p>
                        )}
                      </div>
                      <span className="sr-only">
                        {open ? 'Collapse' : 'Expand'} house details
                      </span>
                      <Chevron open={open} />
                    </button>

                    {open && (
                      <div className="space-y-8 p-5">
                        <div className="min-w-0">
                          <h4 className="text-xs font-medium uppercase tracking-wide text-faint">
                            Roommates
                          </h4>
                          <div className="mb-3 mt-2 sm:hidden">
                            <div className="w-22">
                              <HouseBedGrid
                                capacity={house.capacity}
                                pokemon={house.pokemon}
                                size="sm"
                              />
                            </div>
                          </div>
                          {house.pokemon.length === 0 ? (
                            <p className="mt-2 text-sm text-faint">
                              This house is unused. Extra capacity is fine if you
                              want room to grow or mirror in-game empty homes.
                            </p>
                          ) : null}
                          <ul className="mt-3 space-y-2">
                            {house.pokemon.map((p) => (
                              <li
                                key={p.id}
                                className="flex items-center gap-3 rounded-lg bg-inset/60 px-3 py-2"
                              >
                                <Image
                                  src={p.sprite}
                                  alt={p.name}
                                  width={36}
                                  height={36}
                                  className="object-contain"
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = 'none';
                                  }}
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-baseline gap-2">
                                    <span className="font-mono text-xs text-faint">
                                      {p.number}
                                    </span>
                                    <span className="font-medium">
                                      {p.name}
                                    </span>
                                  </div>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {p.favorites.slice(0, 5).map((f) => (
                                      <span
                                        key={f}
                                        className="rounded bg-panel px-1.5 py-0.5 text-[10px] text-muted"
                                      >
                                        {f}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                          {house.sharedFavorites.length > 0 && (
                            <div className="mt-4">
                              <span className="text-xs text-faint">
                                Everyone loves:{' '}
                              </span>
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                {house.sharedFavorites.map((f) => (
                                  <span
                                    key={f}
                                    className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs text-accent-soft ring-1 ring-accent/25"
                                  >
                                    {f}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {showFurnishingIdeas && (
                          <div className="min-w-0 border-t border-edge/80 pt-8">
                            <h4 className="text-xs font-medium uppercase tracking-wide text-faint">
                              Furnishings &amp; items
                            </h4>
                            {house.pokemon.length === 0 ? (
                              <p className="mt-3 text-sm text-faint">
                                No suggestions for an empty house.
                              </p>
                            ) : (
                              <>
                                <p className="mt-1 text-xs text-faint">
                                  Items on Serebii&apos;s category lists for this
                                  house&apos;s favorites are shown first (best
                                  documented). Below that, expand{' '}
                                  <span className="text-muted">
                                    Keyword guesses only
                                  </span>{' '}
                                  for keyword-ranked picks that are not on those
                                  lists (including flavor matches, where we
                                  don&apos;t map Serebii yet). Ranking still uses
                                  keyword scores and a roommate-fairness penalty.
                                </p>
                                <div className="mt-4 space-y-4">
                                  <div>
                                    <h5 className="text-[11px] font-semibold uppercase tracking-wide text-emerald-400/90">
                                      Serebii lists (official)
                                    </h5>
                                    {house.suggestedItems.official.length ===
                                    0 ? (
                                      <p className="mt-2 text-sm text-faint">
                                        No items from Serebii&apos;s pages for
                                        this house&apos;s favorites (their lists
                                        may be incomplete, or keyword matches
                                        only appear below).
                                      </p>
                                    ) : (
                                      <ol className="mt-2 space-y-2">
                                        {house.suggestedItems.official.map(
                                          (item, rank) => (
                                            <FurnishingItemRow
                                              key={item.slug}
                                              item={item}
                                              rank={rank + 1}
                                            />
                                          ),
                                        )}
                                      </ol>
                                    )}
                                  </div>
                                  {house.suggestedItems.heuristic.length >
                                    0 && (
                                    <div className="rounded-lg border border-edge bg-inset/30">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setHeuristicFurnishingOpen((prev) => ({
                                            ...prev,
                                            [house.index]:
                                              !prev[house.index],
                                          }))
                                        }
                                        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm text-muted transition hover:bg-panel/50 hover:text-ink-soft"
                                        aria-expanded={Boolean(
                                          heuristicFurnishingOpen[house.index],
                                        )}
                                      >
                                        <span>
                                          <span className="font-medium text-ink-soft">
                                            Keyword guesses only
                                          </span>
                                          <span className="ml-2 text-xs text-faint">
                                            (
                                            {
                                              house.suggestedItems.heuristic
                                                .length
                                            }{' '}
                                            items — not on Serebii for these
                                            favorites)
                                          </span>
                                        </span>
                                        <Chevron
                                          open={Boolean(
                                            heuristicFurnishingOpen[
                                              house.index
                                            ],
                                          )}
                                        />
                                      </button>
                                      {heuristicFurnishingOpen[house.index] && (
                                        <ol className="space-y-2 border-t border-edge px-3 py-3">
                                          {house.suggestedItems.heuristic.map(
                                            (item, rank) => (
                                              <FurnishingItemRow
                                                key={item.slug}
                                                item={item}
                                                rank={rank + 1}
                                              />
                                            ),
                                          )}
                                        </ol>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Single-house preview (≤4) */}
        {selectedIds.length > 0 && selectedIds.length <= 4 && data && (
          <section className="space-y-4 border-t border-edge pt-10">
            <h2 className="text-lg font-semibold text-ink-soft">
              Single-house preview
            </h2>
            <p className="text-sm text-faint">
              If you treat the current selection as one house (ignoring the
              multi-house planner above), here is the same compatibility readout
              as before.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div
                className={`flex flex-col items-center justify-center rounded-xl border border-edge bg-panel p-6 ring-1 ${scoreBg(data.compatibilityScore)}`}
              >
                <span className="text-sm font-medium text-muted">
                  Compatibility
                </span>
                <span
                  className={`mt-1 text-4xl font-extrabold tabular-nums ${scoreColor(data.compatibilityScore)}`}
                >
                  {data.compatibilityScore}%
                </span>
              </div>
              <div className="rounded-xl border border-edge bg-panel p-6">
                <h3 className="text-sm font-medium text-muted">Habitat</h3>
                {data.habitatConflicts.length > 0 ? (
                  <p className="mt-2 text-sm text-red-400">
                    Mixed habitat types — not valid as one house.
                  </p>
                ) : (
                  <p className="mt-2 text-lg font-semibold text-green-500">
                    {data.pokemon[0]?.idealHabitat ?? '—'}
                  </p>
                )}
              </div>
            </div>
            {recs && recs.length > 0 && selectedIds.length < 4 && (
              <div className="rounded-xl border border-edge bg-panel p-5">
                <h3 className="text-sm font-medium text-muted">
                  Candidates to add to town
                </h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {recs.slice(0, 8).map((rec) => (
                    <button
                      key={rec.id}
                      type="button"
                      onClick={() => addPokemon(rec.id)}
                      disabled={selectedIds.length >= 48}
                      className="flex items-center gap-2 rounded-lg border border-edge bg-inset p-2 text-left text-sm hover:border-accent/40"
                    >
                      <Image
                        src={rec.sprite}
                        alt={rec.name}
                        width={28}
                        height={28}
                        className="object-contain"
                      />
                      <span className="truncate">{rec.name}</span>
                      <span
                        className={`ml-auto text-xs tabular-nums ${scoreColor(rec.score)}`}
                      >
                        {rec.score}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {selectedIds.length > 0 && selectedIds.length <= 4 && analysis.isLoading && (
          <p className="text-center text-sm text-faint">Loading preview…</p>
        )}
      </div>
    </div>
  );
}
