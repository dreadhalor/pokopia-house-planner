/**
 * Fetches Serebii favorites pages and writes item slugs per category (Pokopia House Planner).
 * Run from repo root: npx tsx scripts/build-serebii-favorite-map.ts
 */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { favoriteCategories } from '../src/data/favorite-categories';

interface RawRow {
  slug: string;
  imageSlug: string;
}

const rawPath = join(process.cwd(), 'src/data/raw/serebii-items.json');
const outPath = join(
  process.cwd(),
  'src/data/raw/serebii-favorite-items-by-category.json',
);

const rawItems: RawRow[] = JSON.parse(readFileSync(rawPath, 'utf-8'));
const byImageSlug = new Map<string, string>();
for (const r of rawItems) {
  byImageSlug.set(r.imageSlug.toLowerCase(), r.slug);
}

function parseItemSlugs(html: string): string[] {
  const re = /pokemonpokopia\/items\/([a-z0-9]+)\.shtml/gi;
  const seen = new Set<string>();
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const s = m[1].toLowerCase();
    if (!seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  }
  return out;
}

async function main() {
  const objectCats = favoriteCategories.filter((c) => !c.id.endsWith('-flavors'));
  const map: Record<string, string[]> = {};

  for (const cat of objectCats) {
    const page = cat.id.replace(/-/g, '');
    const url = `https://www.serebii.net/pokemonpokopia/favorites/${page}.shtml`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`HTTP ${res.status} ${cat.id}`);
      map[page] = [];
      continue;
    }
    const html = await res.text();
    const imageSlugs = parseItemSlugs(html);
    const slugs: string[] = [];
    const seenSlug = new Set<string>();
    for (const img of imageSlugs) {
      const slug = byImageSlug.get(img);
      if (slug && !seenSlug.has(slug)) {
        seenSlug.add(slug);
        slugs.push(slug);
      }
    }
    map[page] = slugs;
    console.log(`${page}: ${slugs.length} items`);
  }

  writeFileSync(outPath, `${JSON.stringify(map, null, 2)}\n`, 'utf-8');
  console.log(`Wrote ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
