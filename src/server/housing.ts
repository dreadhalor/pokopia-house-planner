import type { Item } from '@/data/items';
import type { Pokemon } from '@/data/pokemon';
import {
  items,
  getItemImagePath,
  getFavoriteCategoryByName,
  serebiiDocumentedFavoritesForItem,
} from '@/data';

export function computePairwiseOverlap(
  aFavs: string[],
  bFavs: string[],
): number {
  const set = new Set(aFavs);
  return bFavs.filter((f) => set.has(f)).length;
}

export function compatibilityScoreForGroup(selected: Pokemon[]): number {
  if (selected.length <= 1) return 100;
  const maxPairs = (selected.length * (selected.length - 1)) / 2;
  let pairwiseScore = 0;
  for (let i = 0; i < selected.length; i++) {
    for (let j = i + 1; j < selected.length; j++) {
      pairwiseScore += computePairwiseOverlap(
        selected[i]!.favorites.slice(0, 5),
        selected[j]!.favorites.slice(0, 5),
      );
    }
  }
  const maxPossibleOverlap = maxPairs * 5;
  return maxPossibleOverlap > 0
    ? Math.round((pairwiseScore / maxPossibleOverlap) * 100)
    : 100;
}

export function sharedFavoritesForGroup(selected: Pokemon[]): string[] {
  if (selected.length === 0) return [];
  const favoriteSets = selected.map((p) => new Set(p.favorites.slice(0, 5)));
  return [...favoriteSets[0]!].filter((fav) =>
    favoriteSets.every((s) => s.has(fav)),
  );
}

function isPlaceableItem(item: Item): boolean {
  if (item.category === 'Key Items' || item.category === 'Materials') {
    return false;
  }
  return (
    item.category === 'Furniture' ||
    item.category === 'Outdoor' ||
    item.category === 'Food' ||
    item.category === 'Nature' ||
    item.category === 'Utilities' ||
    (item.category === 'Misc' &&
      ['Decoration', 'Food', 'Relaxation', 'Toy'].includes(item.tag))
  );
}

export function itemScoreForPokemon(item: Item, p: Pokemon): number {
  let score = 0;
  const seen = new Set<string>();
  for (const fav of p.favorites.slice(0, 5)) {
    const cat = getFavoriteCategoryByName(fav);
    if (!cat || seen.has(cat.id)) continue;
    seen.add(cat.id);
    score += cat.itemScorer(item);
  }
  const flavorCat = getFavoriteCategoryByName(p.flavor);
  if (flavorCat && !seen.has(flavorCat.id)) {
    score += flavorCat.itemScorer(item);
  }
  return score;
}

const DISAGREEMENT_WEIGHT = 0.35;
const MAX_BRUTE_PARTITION = 11;
const MAX_BRUTE_SUBSET = 11;

/** Label for a house with no Pokémon (extra real estate). */
export const VACANT_HOUSE_HABITAT = 'Vacant';

function* combinations<T>(arr: T[], k: number): Generator<T[]> {
  if (k === 0) {
    yield [];
    return;
  }
  if (arr.length < k) return;
  const [first, ...rest] = arr;
  for (const tail of combinations(rest, k - 1)) {
    yield [first!, ...tail];
  }
  yield* combinations(rest, k);
}

function greedyPartition(mons: Pokemon[], caps: number[]): Pokemon[][] {
  const remaining = [...mons];
  const capsSorted = [...caps].sort((a, b) => b - a);
  const groups: Pokemon[][] = [];

  function avgCompatWithGroup(p: Pokemon, group: Pokemon[]): number {
    if (group.length === 0) return 0;
    let sum = 0;
    for (const g of group) {
      sum += computePairwiseOverlap(
        p.favorites.slice(0, 5),
        g.favorites.slice(0, 5),
      );
    }
    return sum / group.length;
  }

  for (const s of capsSorted) {
    if (remaining.length < s) break;
    const seedIdx = 0;
    const seed = remaining[seedIdx]!;
    const group: Pokemon[] = [seed];
    remaining.splice(seedIdx, 1);

    while (group.length < s && remaining.length > 0) {
      let bestI = 0;
      let bestScore = -1;
      for (let i = 0; i < remaining.length; i++) {
        const sc = avgCompatWithGroup(remaining[i]!, group);
        if (sc > bestScore) {
          bestScore = sc;
          bestI = i;
        }
      }
      group.push(remaining[bestI]!);
      remaining.splice(bestI, 1);
    }
    groups.push(group);
  }

  return groups;
}

function bestPartitionBrute(mons: Pokemon[], caps: number[]): Pokemon[][] {
  const sumCaps = caps.reduce((a, b) => a + b, 0);
  if (sumCaps !== mons.length) {
    return greedyPartition(mons, caps);
  }
  if (caps.length === 1) {
    return [mons];
  }

  const capsSorted = [...caps].sort((a, b) => b - a);
  const s = capsSorted[0]!;
  const restCaps = capsSorted.slice(1);

  let bestScore = -1;
  let bestGroups: Pokemon[][] | null = null;

  for (const combo of combinations(mons, s)) {
    const comboSet = new Set(combo);
    const restMons = mons.filter((m) => !comboSet.has(m));
    const tailGroups =
      restCaps.length === 0
        ? []
        : restMons.length === 0
          ? []
          : bestPartitionBrute(restMons, restCaps);
    if (restCaps.length > 0 && tailGroups.length === 0) continue;

    const gScore = compatibilityScoreForGroup(combo);
    const tailScore = tailGroups.reduce(
      (acc, g) => acc + compatibilityScoreForGroup(g),
      0,
    );
    const total = gScore + tailScore;
    if (total > bestScore) {
      bestScore = total;
      bestGroups = [combo, ...tailGroups];
    }
  }

  return bestGroups ?? greedyPartition(mons, caps);
}

export function partitionPokemonIntoHouses(
  mons: Pokemon[],
  caps: number[],
): Pokemon[][] {
  const sumCaps = caps.reduce((a, b) => a + b, 0);
  if (sumCaps !== mons.length) {
    return greedyPartition(mons, caps);
  }
  if (mons.length <= MAX_BRUTE_PARTITION) {
    return bestPartitionBrute(mons, caps);
  }
  return greedyPartition(mons, caps);
}

function enumerateHouseAssignments(
  houseCaps: number[],
  remaining: Record<string, number>,
  habitatOrder: string[],
): string[][] {
  const sortedIdx = houseCaps
    .map((c, i) => ({ c, i }))
    .sort((a, b) => b.c - a.c)
    .map((x) => x.i);
  const sortedCaps = sortedIdx.map((i) => houseCaps[i]!);

  const results: string[][] = [];
  function dfs(i: number, rem: Record<string, number>, path: string[]) {
    if (i === sortedCaps.length) {
      if (habitatOrder.every((h) => (rem[h] ?? 0) === 0)) {
        results.push([...path]);
      }
      return;
    }
    const c = sortedCaps[i]!;
    for (const h of habitatOrder) {
      if ((rem[h] ?? 0) < c) continue;
      path.push(h);
      dfs(i + 1, { ...rem, [h]: rem[h]! - c }, path);
      path.pop();
    }
  }

  dfs(0, { ...remaining }, []);

  return results.map((habitatPath) => {
    const out = new Array<string>(houseCaps.length);
    for (let j = 0; j < sortedIdx.length; j++) {
      out[sortedIdx[j]!] = habitatPath[j]!;
    }
    return out;
  });
}

/** @deprecated Prefer buildHouseCapsFromMaxes for partition input. */
export function expandHouseCounts(housesOf2: number, housesOf4: number): number[] {
  return [
    ...Array.from({ length: housesOf4 }, () => 4),
    ...Array.from({ length: housesOf2 }, () => 2),
  ];
}

const HOUSE_CAP_BUILD_INF = 999;

/**
 * Build a concrete house capacity list from per-type maximums.
 * `null` = unlimited for that size; prefer adding 4-bed houses before 2-bed.
 */
export function buildHouseCapsFromMaxes(
  mons: Pokemon[],
  max4: number | null,
  max2: number | null,
):
  | { ok: true; caps: number[] }
  | { ok: false; error: string } {
  const n = mons.length;
  if (n === 0) {
    return { ok: true, caps: [] };
  }

  const u4 = max4 === null ? HOUSE_CAP_BUILD_INF : max4;
  const u2 = max2 === null ? HOUSE_CAP_BUILD_INF : max2;

  if (u4 === 0 && u2 === 0) {
    return {
      ok: false,
      error:
        'Set a higher maximum for at least one house type, or leave blank for unlimited.',
    };
  }

  const byHabitat = new Map<string, number>();
  for (const p of mons) {
    byHabitat.set(p.idealHabitat, (byHabitat.get(p.idealHabitat) ?? 0) + 1);
  }

  let hMin = 0;
  for (const c of byHabitat.values()) {
    hMin += Math.ceil(c / 4);
  }

  let n4 = 0;
  let n2 = 0;
  let cap = 0;
  let slots = 0;

  while (slots < hMin && n4 < u4) {
    n4++;
    slots++;
    cap += 4;
  }
  while (slots < hMin && n2 < u2) {
    n2++;
    slots++;
    cap += 2;
  }
  if (slots < hMin) {
    return {
      ok: false,
      error:
        'These limits cannot fit every habitat — allow more 4-bed houses or leave maximums blank for unlimited.',
    };
  }

  const ABS_MAX_HOUSES = 256;
  while (cap < n && n4 < u4 && slots < ABS_MAX_HOUSES) {
    n4++;
    slots++;
    cap += 4;
  }
  while (cap < n && n2 < u2 && slots < ABS_MAX_HOUSES) {
    n2++;
    slots++;
    cap += 2;
  }

  if (cap < n) {
    return {
      ok: false,
      error:
        'Not enough capacity under these maximums — raise the limits or leave them blank for unlimited.',
    };
  }

  return {
    ok: true,
    caps: [...Array.from({ length: n4 }, () => 4), ...Array.from({ length: n2 }, () => 2)],
  };
}

function aggregateScores(
  houses: TownPartitionResult['houses'],
): Pick<TownPartitionResult, 'sumHouseCompatibility' | 'averageHouseCompatibility'> {
  const occupied = houses.filter((h) => h.members.length > 0);
  const sumHouseCompatibility = occupied.reduce(
    (acc, h) => acc + h.compatibilityScore,
    0,
  );
  return {
    sumHouseCompatibility,
    averageHouseCompatibility: Math.round(
      sumHouseCompatibility / Math.max(1, occupied.length),
    ),
  };
}

function pickBestSubsetForHouse(pool: Pokemon[], k: number): Pokemon[] {
  if (k <= 0) return [];
  if (k >= pool.length) return [...pool];
  if (pool.length <= MAX_BRUTE_SUBSET) {
    let best: Pokemon[] | null = null;
    let bestScore = -1;
    for (const combo of combinations(pool, k)) {
      const sc = compatibilityScoreForGroup(combo);
      if (sc > bestScore) {
        bestScore = sc;
        best = combo;
      }
    }
    return best ?? pool.slice(0, k);
  }
  const remaining = [...pool];
  const seed = remaining.shift()!;
  const group: Pokemon[] = [seed];
  function avgCompatWithGroup(p: Pokemon, g: Pokemon[]): number {
    if (g.length === 0) return 0;
    let sum = 0;
    for (const x of g) {
      sum += computePairwiseOverlap(
        p.favorites.slice(0, 5),
        x.favorites.slice(0, 5),
      );
    }
    return sum / g.length;
  }
  while (group.length < k && remaining.length > 0) {
    let bestI = 0;
    let bestScore = -1;
    for (let i = 0; i < remaining.length; i++) {
      const sc = avgCompatWithGroup(remaining[i]!, group);
      if (sc > bestScore) {
        bestScore = sc;
        bestI = i;
      }
    }
    group.push(remaining.splice(bestI, 1)[0]!);
  }
  return group;
}

function optimizeTownHousingWithSlack(
  allMons: Pokemon[],
  houseCaps: number[],
): { ok: true; result: TownPartitionResult } | { ok: false; error: string } {
  const remaining = new Map<string, Pokemon[]>();
  for (const p of allMons) {
    const list = remaining.get(p.idealHabitat) ?? [];
    list.push(p);
    remaining.set(p.idealHabitat, list);
  }

  function totalRemaining(): number {
    let n = 0;
    for (const list of remaining.values()) n += list.length;
    return n;
  }

  const houses: TownPartitionResult['houses'] = [];

  for (let i = 0; i < houseCaps.length; i++) {
    const cap = houseCaps[i]!;
    if (totalRemaining() === 0) {
      houses.push({
        index: i,
        capacity: cap,
        idealHabitat: VACANT_HOUSE_HABITAT,
        members: [],
        compatibilityScore: 0,
        sharedFavorites: [],
      });
      continue;
    }

    const candidates = [...remaining.entries()].filter(
      ([, mons]) => mons.length > 0,
    );

    candidates.sort((a, b) => {
      const fillA = Math.min(a[1].length, cap);
      const fillB = Math.min(b[1].length, cap);
      if (fillB !== fillA) return fillB - fillA;
      if (b[1].length !== a[1].length) return b[1].length - a[1].length;
      return a[0].localeCompare(b[0]);
    });

    const [bestH, pool] = candidates[0]!;
    const k = Math.min(cap, pool.length);
    const chosen = pickBestSubsetForHouse(pool, k);
    const chosenSet = new Set(chosen);
    remaining.set(
      bestH,
      pool.filter((p) => !chosenSet.has(p)),
    );

    houses.push({
      index: i,
      capacity: cap,
      idealHabitat: bestH,
      members: chosen,
      compatibilityScore: compatibilityScoreForGroup(chosen),
      sharedFavorites: sharedFavoritesForGroup(chosen),
    });
  }

  if (totalRemaining() > 0) {
    return {
      ok: false,
      error:
        'Could not assign every Pokémon without mixing habitat types in the same house. Add more or larger houses, or remove some Pokémon.',
    };
  }

  const scores = aggregateScores(houses);
  return {
    ok: true,
    result: {
      houses,
      ...scores,
    },
  };
}

export type TownPartitionResult = {
  sumHouseCompatibility: number;
  averageHouseCompatibility: number;
  houses: {
    index: number;
    capacity: number;
    idealHabitat: string;
    members: Pokemon[];
    compatibilityScore: number;
    sharedFavorites: string[];
  }[];
};

function optimizeTownHousingExact(
  allMons: Pokemon[],
  houseCaps: number[],
): { ok: true; result: TownPartitionResult } | { ok: false; error: string } {
  const bucket = new Map<string, Pokemon[]>();
  for (const p of allMons) {
    const list = bucket.get(p.idealHabitat) ?? [];
    list.push(p);
    bucket.set(p.idealHabitat, list);
  }

  const habitatOrder = [...bucket.keys()].sort();
  const remaining: Record<string, number> = {};
  for (const h of habitatOrder) {
    remaining[h] = bucket.get(h)!.length;
  }

  const assignments = enumerateHouseAssignments(
    houseCaps,
    remaining,
    habitatOrder,
  );

  if (assignments.length === 0) {
    return {
      ok: false,
      error:
        'No valid way to assign these house sizes to your habitat mix. Try different counts of 2- vs 4-person houses.',
    };
  }

  let bestTotal = -1;
  let bestPlan: {
    assignment: string[];
    groupsPerHabitat: Map<string, Pokemon[][]>;
  } | null = null;

  for (const assignment of assignments) {
    const capsByHabitat = new Map<string, number[]>();
    for (let i = 0; i < assignment.length; i++) {
      const h = assignment[i]!;
      const c = houseCaps[i]!;
      const arr = capsByHabitat.get(h) ?? [];
      arr.push(c);
      capsByHabitat.set(h, arr);
    }

    const groupsPerHabitat = new Map<string, Pokemon[][]>();
    let total = 0;
    let failed = false;

    for (const h of habitatOrder) {
      const mons = [...bucket.get(h)!];
      const caps = capsByHabitat.get(h) ?? [];
      const sum = caps.reduce((a, b) => a + b, 0);
      if (sum !== mons.length) {
        failed = true;
        break;
      }
      const groups = partitionPokemonIntoHouses(mons, caps);
      groupsPerHabitat.set(h, groups);
      for (const g of groups) {
        total += compatibilityScoreForGroup(g);
      }
    }

    if (failed) continue;
    if (total > bestTotal) {
      bestTotal = total;
      bestPlan = { assignment, groupsPerHabitat };
    }
  }

  if (!bestPlan) {
    return {
      ok: false,
      error: 'Could not partition Pokémon into the requested houses.',
    };
  }

  const houses: TownPartitionResult['houses'] = [];
  const nextHouseOfHabitat = new Map<string, number>();
  for (const h of habitatOrder) {
    nextHouseOfHabitat.set(h, 0);
  }

  for (let i = 0; i < houseCaps.length; i++) {
    const h = bestPlan.assignment[i]!;
    const cap = houseCaps[i]!;
    const habitatGroups = bestPlan.groupsPerHabitat.get(h);
    if (!habitatGroups || habitatGroups.length === 0) {
      return { ok: false, error: 'Internal partition error.' };
    }
    const k = nextHouseOfHabitat.get(h) ?? 0;
    const group = habitatGroups[k];
    if (!group) {
      return { ok: false, error: 'Internal partition error.' };
    }
    nextHouseOfHabitat.set(h, k + 1);
    houses.push({
      index: i,
      capacity: cap,
      idealHabitat: h,
      members: group,
      compatibilityScore: compatibilityScoreForGroup(group),
      sharedFavorites: sharedFavoritesForGroup(group),
    });
  }

  const scores = aggregateScores(houses);
  return {
    ok: true,
    result: {
      houses,
      ...scores,
    },
  };
}

type WorkingHouse = {
  index: number;
  capacity: number;
  idealHabitat: string;
  members: Pokemon[];
};

function totalPlanCompatibilitySum(work: WorkingHouse[]): number {
  return work.reduce((s, h) => s + compatibilityScoreForGroup(h.members), 0);
}

function refreshWorkingHouse(h: WorkingHouse): void {
  if (h.members.length === 0) {
    h.idealHabitat = VACANT_HOUSE_HABITAT;
  } else {
    h.idealHabitat = h.members[0]!.idealHabitat;
  }
}

function scoreDeltaIfSwap(
  work: WorkingHouse[],
  i: number,
  j: number,
  ii: number,
  jj: number,
): number {
  const hi = work[i]!;
  const hj = work[j]!;
  const mi = hi.members[ii];
  const mj = hj.members[jj];
  if (!mi || !mj || mi.idealHabitat !== mj.idealHabitat) {
    return -Infinity;
  }
  const before =
    compatibilityScoreForGroup(hi.members) +
    compatibilityScoreForGroup(hj.members);
  const ai = [...hi.members];
  const aj = [...hj.members];
  const t = ai[ii]!;
  ai[ii] = aj[jj]!;
  aj[jj] = t;
  const after = compatibilityScoreForGroup(ai) + compatibilityScoreForGroup(aj);
  return after - before;
}

function scoreDeltaIfMove(
  work: WorkingHouse[],
  from: number,
  to: number,
  miIdx: number,
): number {
  const hi = work[from]!;
  const hj = work[to]!;
  if (hi.members.length === 0) return -Infinity;
  const m = hi.members[miIdx];
  if (!m) return -Infinity;
  if (hj.members.length >= hj.capacity) return -Infinity;
  if (
    hj.members.length > 0 &&
    hj.members[0]!.idealHabitat !== m.idealHabitat
  ) {
    return -Infinity;
  }
  const before =
    compatibilityScoreForGroup(hi.members) +
    compatibilityScoreForGroup(hj.members);
  const ai = hi.members.filter((_, k) => k !== miIdx);
  const aj = [...hj.members, m];
  const after = compatibilityScoreForGroup(ai) + compatibilityScoreForGroup(aj);
  return after - before;
}

function applySwap(
  work: WorkingHouse[],
  i: number,
  j: number,
  ii: number,
  jj: number,
): void {
  const hi = work[i]!;
  const hj = work[j]!;
  const t = hi.members[ii]!;
  hi.members[ii] = hj.members[jj]!;
  hj.members[jj] = t;
  refreshWorkingHouse(hi);
  refreshWorkingHouse(hj);
}

function applyMove(
  work: WorkingHouse[],
  from: number,
  to: number,
  miIdx: number,
): void {
  const hi = work[from]!;
  const hj = work[to]!;
  const [m] = hi.members.splice(miIdx, 1);
  if (m) hj.members.push(m);
  refreshWorkingHouse(hi);
  refreshWorkingHouse(hj);
}

const DEEP_SEARCH_MAX_ROUNDS = 80;

function deepLocalSearchPlan(result: TownPartitionResult): TownPartitionResult {
  const work: WorkingHouse[] = result.houses.map((h) => ({
    index: h.index,
    capacity: h.capacity,
    idealHabitat: h.idealHabitat,
    members: [...h.members],
  }));
  for (const h of work) {
    refreshWorkingHouse(h);
  }

  for (let round = 0; round < DEEP_SEARCH_MAX_ROUNDS; round++) {
    let bestGain = 0;
    let bestSwap: {
      i: number;
      j: number;
      ii: number;
      jj: number;
    } | null = null;
    let bestMove: {
      from: number;
      to: number;
      miIdx: number;
    } | null = null;

    for (let i = 0; i < work.length; i++) {
      for (let j = i + 1; j < work.length; j++) {
        const hi = work[i]!;
        const hj = work[j]!;
        for (let ii = 0; ii < hi.members.length; ii++) {
          for (let jj = 0; jj < hj.members.length; jj++) {
            const g = scoreDeltaIfSwap(work, i, j, ii, jj);
            if (g > bestGain) {
              bestGain = g;
              bestSwap = { i, j, ii, jj };
              bestMove = null;
            }
          }
        }
      }
    }

    for (let from = 0; from < work.length; from++) {
      for (let to = 0; to < work.length; to++) {
        if (from === to) continue;
        const hi = work[from]!;
        for (let miIdx = 0; miIdx < hi.members.length; miIdx++) {
          const g = scoreDeltaIfMove(work, from, to, miIdx);
          if (g > bestGain) {
            bestGain = g;
            bestSwap = null;
            bestMove = { from, to, miIdx };
          }
        }
      }
    }

    if (bestGain <= 0) break;
    if (bestSwap) {
      applySwap(work, bestSwap.i, bestSwap.j, bestSwap.ii, bestSwap.jj);
    } else if (bestMove) {
      applyMove(work, bestMove.from, bestMove.to, bestMove.miIdx);
    }
  }

  const houses: TownPartitionResult['houses'] = work.map((h) => ({
    index: h.index,
    capacity: h.capacity,
    idealHabitat: h.idealHabitat,
    members: h.members,
    compatibilityScore: compatibilityScoreForGroup(h.members),
    sharedFavorites: sharedFavoritesForGroup(h.members),
  }));

  return {
    houses,
    ...aggregateScores(houses),
  };
}

export function optimizeTownHousing(
  allMons: Pokemon[],
  houseCaps: number[],
  options?: { deepOptimize?: boolean },
): { ok: true; result: TownPartitionResult } | { ok: false; error: string } {
  const totalSlots = houseCaps.reduce((a, b) => a + b, 0);
  if (totalSlots < allMons.length) {
    return {
      ok: false,
      error: `Not enough bed slots (${totalSlots}) for ${allMons.length} Pokémon.`,
    };
  }

  if (allMons.length === 0) {
    const houses: TownPartitionResult['houses'] = houseCaps.map((cap, i) => ({
      index: i,
      capacity: cap,
      idealHabitat: VACANT_HOUSE_HABITAT,
      members: [],
      compatibilityScore: 0,
      sharedFavorites: [],
    }));
    return {
      ok: true,
      result: {
        houses,
        sumHouseCompatibility: 0,
        averageHouseCompatibility: 0,
      },
    };
  }

  let base: { ok: true; result: TownPartitionResult } | { ok: false; error: string };
  if (totalSlots === allMons.length) {
    base = optimizeTownHousingExact(allMons, houseCaps);
  } else {
    base = optimizeTownHousingWithSlack(allMons, houseCaps);
  }

  if (!base.ok) return base;
  if (!options?.deepOptimize) return base;

  return {
    ok: true,
    result: deepLocalSearchPlan(base.result),
  };
}

export type SuggestedHouseItem = {
  name: string;
  slug: string;
  image: string;
  category: string;
  tag: string;
  totalAppeal: number;
  disagreement: number;
  balanceScore: number;
  perPokemon: { id: string; name: string; score: number }[];
  /** Serebii category pages list this item for these house favorites (authoritative when non-empty). */
  serebiiDocumentedFavorites: string[];
};

/**
 * Ranked placeable items that appear on Serebii’s per-category favorites lists
 * for this house’s favorites (and flavor). Keyword heuristics are not used for inclusion.
 */
export function rankedItemsForHouse(
  members: Pokemon[],
  limit: number,
): SuggestedHouseItem[] {
  const ranked: SuggestedHouseItem[] = [];

  for (const item of items) {
    if (!isPlaceableItem(item)) continue;
    const serebiiDocumentedFavorites = serebiiDocumentedFavoritesForItem(
      item.slug,
      members,
    );
    if (serebiiDocumentedFavorites.length === 0) continue;

    const perPokemon = members.map((p) => {
      let score = itemScoreForPokemon(item, p);
      const nameHits = new Set(
        [...p.favorites.slice(0, 5), p.flavor]
          .map((f) => getFavoriteCategoryByName(f)?.name)
          .filter((n): n is string => Boolean(n)),
      );
      const cares = serebiiDocumentedFavorites.some((c) => nameHits.has(c));
      if (cares && score < 1) score = 1;
      return { id: p.id, name: p.name, score };
    });

    const scores = perPokemon.map((x) => x.score);
    const totalAppeal = scores.reduce((a, b) => a + b, 0);
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const disagreement = max - min;
    const balanceScore = totalAppeal - DISAGREEMENT_WEIGHT * disagreement;

    ranked.push({
      name: item.name,
      slug: item.slug,
      image: getItemImagePath(item),
      category: item.category,
      tag: item.tag,
      totalAppeal,
      disagreement,
      balanceScore,
      perPokemon,
      serebiiDocumentedFavorites,
    });
  }

  ranked.sort((a, b) => b.balanceScore - a.balanceScore);
  return ranked.slice(0, limit);
}
