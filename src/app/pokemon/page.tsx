'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { trpc } from '@/lib/trpc';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
} from '@tanstack/react-table';

const LOCATIONS = [
  'Withered Wastelands',
  'Bleak Beach',
  'Rocky Ridges',
  'Sparkling Skylands',
  'Palette Town',
  'Dream Island',
] as const;

const IDEAL_HABITATS = [
  'Bright',
  'Cool',
  'Dark',
  'Dry',
  'Humid',
  'Warm',
] as const;

const SPECIALTIES = [
  'Appraise',
  'Build',
  'Bulldoze',
  'Burn',
  'Chop',
  'Collect',
  'Crush',
  'DJ',
  'Dream Island',
  'Eat',
  'Engineer',
  'Explode',
  'Fly',
  'Gather',
  'Gather Honey',
  'Generate',
  'Grow',
  'Hype',
  'Illuminate',
  'Litter',
  'Paint',
  'Party',
  'Rarify',
  'Recycle',
  'Search',
  'Storage',
  'Teleport',
  'Trade',
  'Transform',
  'Water',
  'Yawn',
] as const;

const RARITIES = ['Common', 'Rare', 'Very Rare'] as const;

const FLAVORS = [
  'Sweet flavors',
  'Sour flavors',
  'Spicy flavors',
  'Bitter flavors',
  'Dry flavors',
] as const;

const RARITY_ORDER: Record<string, number> = {
  Common: 0,
  Rare: 1,
  'Very Rare': 2,
};

type Pokemon = {
  id: string;
  number: string;
  name: string;
  location: string;
  specialties: string[];
  idealHabitat: string;
  favorites: string[];
  flavor: string;
  sprite: string;
  habitats: {
    name: string;
    areas: Record<string, boolean>;
    rarity: string;
    time: string[];
    weather: string[];
  }[];
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function getRarestRarity(habitats: Pokemon['habitats']): string {
  if (habitats.length === 0) return '—';
  let max = -1;
  let label = '—';
  for (const h of habitats) {
    const rank = RARITY_ORDER[h.rarity] ?? -1;
    if (rank > max) {
      max = rank;
      label = h.rarity;
    }
  }
  return label;
}

const columnHelper = createColumnHelper<Pokemon>();

const columns = [
  columnHelper.display({
    id: 'sprite',
    header: '',
    cell: (info) => (
      <div className="flex h-10 w-10 items-center justify-center">
        <Image
          src={info.row.original.sprite}
          alt={info.row.original.name}
          width={40}
          height={40}
          className="object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
    ),
    size: 56,
    enableSorting: false,
  }),
  columnHelper.accessor('number', {
    header: '#',
    cell: (info) => (
      <span className="font-mono text-slate-400">{info.getValue()}</span>
    ),
    sortingFn: (a, b) =>
      parseInt(a.original.id, 10) - parseInt(b.original.id, 10),
    size: 70,
  }),
  columnHelper.accessor('name', {
    header: 'Name',
    cell: (info) => (
      <Link
        href={`/pokemon/${info.row.original.id}`}
        className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
      >
        {info.getValue()}
      </Link>
    ),
  }),
  columnHelper.accessor('location', {
    header: 'Location',
  }),
  columnHelper.accessor('idealHabitat', {
    header: 'Habitat Type',
  }),
  columnHelper.accessor('specialties', {
    header: 'Specialties',
    cell: (info) => (
      <div className="flex flex-wrap gap-1">
        {info.getValue().map((s) => (
          <span
            key={s}
            className="inline-block rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300"
          >
            {s}
          </span>
        ))}
      </div>
    ),
    enableSorting: false,
  }),
  columnHelper.display({
    id: 'rarity',
    header: 'Rarity',
    cell: (info) => {
      const rarity = getRarestRarity(info.row.original.habitats);
      const color =
        rarity === 'Very Rare'
          ? 'text-amber-400'
          : rarity === 'Rare'
            ? 'text-sky-400'
            : 'text-slate-400';
      return <span className={`font-medium ${color}`}>{rarity}</span>;
    },
    sortingFn: (a, b) => {
      const ra = getRarestRarity(a.original.habitats);
      const rb = getRarestRarity(b.original.habitats);
      return (RARITY_ORDER[ra] ?? -1) - (RARITY_ORDER[rb] ?? -1);
    },
    enableSorting: true,
  }),
];

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function PokemonPage() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [idealHabitat, setIdealHabitat] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [rarity, setRarity] = useState('');
  const [flavor, setFlavor] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);

  const debouncedSearch = useDebounce(search, 300);

  const { data: results = [], isLoading } = trpc.pokemon.search.useQuery({
    query: debouncedSearch || undefined,
    location: location || undefined,
    idealHabitat: idealHabitat || undefined,
    specialty: specialty || undefined,
    rarity: rarity || undefined,
    flavor: flavor || undefined,
  });

  const table = useReactTable({
    data: results,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const activeFilterCount = useMemo(
    () =>
      [location, idealHabitat, specialty, rarity, flavor].filter(Boolean)
        .length,
    [location, idealHabitat, specialty, rarity, flavor],
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-slate-50">
            Pokédex
          </h1>
          <p className="mt-2 text-slate-400">
            Search and filter Pokémon across the world of Pokopia.
          </p>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <FilterSelect
            label="Location"
            value={location}
            onChange={setLocation}
            options={LOCATIONS}
          />
          <FilterSelect
            label="Ideal Habitat"
            value={idealHabitat}
            onChange={setIdealHabitat}
            options={IDEAL_HABITATS}
          />
          <FilterSelect
            label="Specialty"
            value={specialty}
            onChange={setSpecialty}
            options={SPECIALTIES}
          />
          <FilterSelect
            label="Rarity"
            value={rarity}
            onChange={setRarity}
            options={RARITIES}
          />
          <FilterSelect
            label="Flavor"
            value={flavor}
            onChange={setFlavor}
            options={FLAVORS}
          />
        </div>

        {/* Results count & clear */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            {isLoading ? (
              'Loading…'
            ) : (
              <>
                <span className="font-semibold text-slate-200">
                  {results.length}
                </span>{' '}
                Pokémon found
                {activeFilterCount > 0 && (
                  <span className="ml-1 text-slate-500">
                    ({activeFilterCount} filter
                    {activeFilterCount > 1 ? 's' : ''} active)
                  </span>
                )}
              </>
            )}
          </p>
          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                setLocation('');
                setIdealHabitat('');
                setSpecialty('');
                setRarity('');
                setFlavor('');
              }}
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-700">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-700 bg-slate-800/80">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={`px-4 py-3 font-semibold text-slate-300 ${
                        header.column.getCanSort()
                          ? 'cursor-pointer select-none hover:text-slate-100 transition-colors'
                          : ''
                      }`}
                      style={{ width: header.getSize() }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1.5">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {header.column.getCanSort() && (
                          <span className="text-slate-500">
                            {{
                              asc: '↑',
                              desc: '↓',
                            }[header.column.getIsSorted() as string] ?? '↕'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-800">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors hover:bg-slate-800/60"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-slate-200">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {!isLoading && results.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    No Pokémon match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
