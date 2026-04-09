import { z } from 'zod';
import type { SavedTown } from '@/stores/towns-store';

export const TOWN_BACKUP_APP = 'pokopedia-house-planner' as const;
export const TOWN_BACKUP_SCHEMA_VERSION = 1;
/** Reject pasted files larger than this (UTF-8 bytes) to protect localStorage. */
export const TOWN_BACKUP_MAX_BYTES = 512 * 1024;

const savedTownSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  pokemonIds: z.array(z.string()),
  housesOf2: z.number().int().min(0).max(64).nullable(),
  housesOf4: z.number().int().min(0).max(64).nullable(),
  updatedAt: z.number(),
});

const envelopeSchema = z.object({
  app: z.literal(TOWN_BACKUP_APP),
  schemaVersion: z.literal(TOWN_BACKUP_SCHEMA_VERSION),
  exportedAt: z.string(),
  towns: z.array(savedTownSchema),
});

export type TownBackupEnvelope = z.infer<typeof envelopeSchema>;

export function stringifyTownBackup(towns: SavedTown[]): string {
  const envelope: TownBackupEnvelope = {
    app: TOWN_BACKUP_APP,
    schemaVersion: TOWN_BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    towns,
  };
  return `${JSON.stringify(envelope, null, 2)}\n`;
}

function utf8ByteLength(s: string): number {
  return new TextEncoder().encode(s).length;
}

export function normalizeImportedTown(
  t: SavedTown,
  validPokemonIds: Set<string>,
): SavedTown {
  const name = t.name.trim() || 'Imported town';
  return {
    ...t,
    name,
    pokemonIds: t.pokemonIds.filter((id) => validPokemonIds.has(id)),
  };
}

export type ParseTownBackupResult =
  | { ok: true; towns: SavedTown[]; strippedPokemonIds: number }
  | { ok: false; error: string };

/**
 * Parse and validate backup JSON. Drops Pokémon ids that are not in the current dex.
 */
export function parseTownBackupJson(
  raw: string,
  validPokemonIds: Set<string>,
): ParseTownBackupResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, error: 'Empty clipboard or file.' };
  }
  if (utf8ByteLength(trimmed) > TOWN_BACKUP_MAX_BYTES) {
    return {
      ok: false,
      error: `Backup is too large (max ${Math.round(TOWN_BACKUP_MAX_BYTES / 1024)} KB).`,
    };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed) as unknown;
  } catch {
    return { ok: false, error: 'Not valid JSON.' };
  }
  const result = envelopeSchema.safeParse(parsed);
  if (!result.success) {
    return {
      ok: false,
      error:
        'Unrecognized backup format. Expected an export from this app (envelope with app, schemaVersion, towns).',
    };
  }
  let strippedPokemonIds = 0;
  const towns = result.data.towns.map((row) => {
    const before = row.pokemonIds.length;
    const normalized = normalizeImportedTown(row, validPokemonIds);
    strippedPokemonIds += before - normalized.pokemonIds.length;
    return normalized;
  });
  if (towns.length === 0) {
    return { ok: false, error: 'Backup contains no towns.' };
  }
  return { ok: true, towns, strippedPokemonIds };
}

export function townBackupFilename(): string {
  const d = new Date();
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `pokopedia-towns-${y}-${mo}-${day}.json`;
}
