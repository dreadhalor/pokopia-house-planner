/** CSV → Pokémon records (used by `parse-data` script; runtime uses `pokemon.json`). */

export interface Pokemon {
  id: string;
  number: string;
  name: string;
  location: string;
  specialties: string[];
  idealHabitat: string;
  favorites: string[];
  flavor: string;
  habitats: {
    name: string;
    areas: Record<string, boolean>;
    rarity: string;
    time: string[];
    weather: string[];
  }[];
}

const AREA_NAMES = [
  'Withered Wastelands',
  'Bleak Beach',
  'Rocky Ridges',
  'Sparkling Skylands',
  'Palette Town',
] as const;

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }

  fields.push(current.trim());
  return fields;
}

function parseHabitatBlock(
  fields: string[],
  startIndex: number,
): Pokemon['habitats'][number] | null {
  const name = fields[startIndex] || '';
  if (!name) return null;

  const areas: Record<string, boolean> = {};
  for (let i = 0; i < AREA_NAMES.length; i++) {
    areas[AREA_NAMES[i]] =
      fields[startIndex + 1 + i]?.toLowerCase() === 'yes';
  }

  const rarity = fields[startIndex + 6] || '';
  const timeStr = fields[startIndex + 7] || '';
  const weatherStr = fields[startIndex + 8] || '';

  return {
    name,
    areas,
    rarity,
    time: timeStr
      ? timeStr
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    weather: weatherStr
      ? weatherStr
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
  };
}

const FAVORITE_NORMALIZATIONS: Record<string, string> = {
  'group activites': 'Group activities',
  'group activities': 'Group activities',
  'sour flavors': 'Sour flavors',
  'spicy flavors': 'Spicy flavors',
  'bitter flavors': 'Bitter flavors',
  'dry flavors': 'Dry flavors',
  'sweet flavors': 'Sweet flavors',
  'noisy stuff': 'Noisy stuff',
  'noise stuff': 'Noisy stuff',
};

function normalizeFavorite(raw: string): string {
  const lookup = FAVORITE_NORMALIZATIONS[raw.toLowerCase()];
  if (lookup) return lookup;
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function toSlugId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function parsePokemonCSV(csvContent: string): Pokemon[] {
  const lines = csvContent.split('\n').filter((line) => line.trim());

  const seen = new Set<string>();
  return lines.slice(1).map((line) => {
    const f = parseCSVLine(line);

    const number = f[0];
    const numericId = number.replace('#', '');
    const name = f[1];
    let id = numericId;
    if (seen.has(id)) {
      id = `${numericId}-${toSlugId(name)}`;
    }
    seen.add(numericId);

    const specialties = [f[3], f[4]].filter(Boolean);
    const rawFavorites = f.slice(6, 11).filter(Boolean);
    const favorites = rawFavorites.map(normalizeFavorite);

    const habitats: Pokemon['habitats'] = [];
    for (const offset of [12, 21, 30]) {
      const habitat = parseHabitatBlock(f, offset);
      if (habitat) habitats.push(habitat);
    }

    return {
      id,
      number,
      name,
      location: f[2],
      specialties,
      idealHabitat: f[5],
      favorites,
      flavor: normalizeFavorite(f[11] || ''),
      habitats,
    };
  });
}
