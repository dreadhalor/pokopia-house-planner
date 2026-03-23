import { create } from 'zustand';
import {
  persist,
  createJSONStorage,
  type StateStorage,
} from 'zustand/middleware';

/** Max saved towns per browser (localStorage stays small). */
export const MAX_TOWNS = 64;

const STORAGE_KEY = 'pokopia-house-planner-towns-v1';
const LEGACY_KEYS = ['nestmate-towns-v1', 'pokopedia-towns-v1'] as const;

function migratingLocalStorage(): StateStorage {
  return {
    getItem: (name) => {
      if (typeof window === 'undefined') return null;
      let value = window.localStorage.getItem(name);
      if (!value && name === STORAGE_KEY) {
        for (const legacy of LEGACY_KEYS) {
          value = window.localStorage.getItem(legacy);
          if (value) {
            window.localStorage.setItem(STORAGE_KEY, value);
            break;
          }
        }
      }
      return value;
    },
    setItem: (name, value) => {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(name, value);
    },
    removeItem: (name) => {
      if (typeof window === 'undefined') return;
      window.localStorage.removeItem(name);
    },
  };
}

export type SavedTown = {
  id: string;
  name: string;
  pokemonIds: string[];
  housesOf2: number;
  housesOf4: number;
  updatedAt: number;
};

function newTownId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `town-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function makeTown(name: string): SavedTown {
  const trimmed = name.trim() || 'New town';
  return {
    id: newTownId(),
    name: trimmed,
    pokemonIds: [],
    housesOf2: 0,
    housesOf4: 1,
    updatedAt: Date.now(),
  };
}

type TownsState = {
  towns: SavedTown[];
  activeTownId: string | null;
  ensureDefaultTown: () => void;
  addTown: (name: string) => string | null;
  deleteTown: (id: string) => void;
  renameTown: (id: string, name: string) => void;
  setActiveTownId: (id: string) => void;
  patchTown: (
    id: string,
    patch: Partial<
      Pick<SavedTown, 'pokemonIds' | 'housesOf2' | 'housesOf4'>
    >,
  ) => void;
  updateActivePokemonIds: (
    next: string[] | ((prev: string[]) => string[]),
  ) => void;
  setActiveHouses: (housesOf2: number, housesOf4: number) => void;
};

export const useTownsStore = create<TownsState>()(
  persist(
    (set, get) => ({
      towns: [],
      activeTownId: null,

      ensureDefaultTown: () => {
        const { towns, activeTownId } = get();
        if (towns.length === 0) {
          const t = makeTown('My town');
          set({ towns: [t], activeTownId: t.id });
          return;
        }
        if (!activeTownId || !towns.some((t) => t.id === activeTownId)) {
          set({ activeTownId: towns[0]!.id });
        }
      },

      addTown: (name) => {
        const { towns } = get();
        if (towns.length >= MAX_TOWNS) return null;
        const t = makeTown(name);
        set({ towns: [...towns, t], activeTownId: t.id });
        return t.id;
      },

      deleteTown: (id) => {
        const { towns, activeTownId } = get();
        const next = towns.filter((t) => t.id !== id);
        const nextActive =
          activeTownId === id ? (next[0]?.id ?? null) : activeTownId;
        set({ towns: next, activeTownId: nextActive });
        if (next.length === 0) {
          get().ensureDefaultTown();
        }
      },

      renameTown: (id, name) => {
        const n = name.trim();
        if (!n) return;
        set({
          towns: get().towns.map((t) =>
            t.id === id ? { ...t, name: n, updatedAt: Date.now() } : t,
          ),
        });
      },

      setActiveTownId: (id) => {
        if (!get().towns.some((t) => t.id === id)) return;
        set({ activeTownId: id });
      },

      patchTown: (id, patch) => {
        set({
          towns: get().towns.map((t) =>
            t.id === id
              ? { ...t, ...patch, updatedAt: Date.now() }
              : t,
          ),
        });
      },

      updateActivePokemonIds: (next) => {
        const id = get().activeTownId;
        if (!id) return;
        const town = get().towns.find((t) => t.id === id);
        if (!town) return;
        const pokemonIds =
          typeof next === 'function' ? next(town.pokemonIds) : next;
        get().patchTown(id, { pokemonIds });
      },

      setActiveHouses: (housesOf2, housesOf4) => {
        const id = get().activeTownId;
        if (!id) return;
        get().patchTown(id, { housesOf2, housesOf4 });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(migratingLocalStorage),
      partialize: (s) => ({
        towns: s.towns,
        activeTownId: s.activeTownId,
      }),
      skipHydration: true,
    },
  ),
);
