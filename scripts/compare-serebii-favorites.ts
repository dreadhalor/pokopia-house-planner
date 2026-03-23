/**
 * One-off: compare Serebii’s documented per-category item lists (treated as
 * official, albeit incomplete) against this app’s keyword itemScorer heuristics
 * (educated guesses). Run from repo root: npx tsx scripts/compare-serebii-favorites.ts
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { favoriteCategories } from '../src/data/favorite-categories';
import type { Item } from '../src/data/items';

interface RawRow {
  name: string;
  slug: string;
  imageSlug: string;
  description: string;
  tag: string;
  category: string;
  locations: string[];
}

const rawPath = join(process.cwd(), 'src/data/raw/serebii-items.json');
const rawItems: RawRow[] = JSON.parse(readFileSync(rawPath, 'utf-8'));

const byImageSlug = new Map<string, RawRow>();
for (const r of rawItems) {
  byImageSlug.set(r.imageSlug.toLowerCase(), r);
}

function toItem(r: RawRow): Item {
  return {
    name: r.name,
    slug: r.slug,
    description: r.description,
    tag: r.tag,
    category: r.category,
    locations: r.locations,
  };
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

function serebiiPageSlugFromCategoryId(id: string): string {
  return id.replace(/-/g, '');
}

async function main() {
  const objectCats = favoriteCategories.filter((c) => !c.id.endsWith('-flavors'));

  const missingOnSerebii: { category: string; slug: string }[] = [];
  const scorerMissesSerebii: { category: string; id: string; name: string; slug: string }[] =
    [];
  const unmappedSlugs: { category: string; imageSlug: string }[] = [];

  for (const cat of objectCats) {
    const page = serebiiPageSlugFromCategoryId(cat.id);
    const url = `https://www.serebii.net/pokemonpokopia/favorites/${page}.shtml`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`HTTP ${res.status} for ${cat.id} -> ${url}`);
      continue;
    }
    const html = await res.text();
    const slugs = parseItemSlugs(html);
    if (slugs.length === 0) {
      console.warn(`No items parsed for ${cat.id} (${url})`);
    }

    const serebiiSet = new Set(slugs);

    for (const imgSlug of slugs) {
      const row = byImageSlug.get(imgSlug);
      if (!row) {
        unmappedSlugs.push({ category: cat.id, imageSlug: imgSlug });
        continue;
      }
      const item = toItem(row);
      const score = cat.itemScorer(item);
      if (score <= 0) {
        scorerMissesSerebii.push({
          category: cat.id,
          id: cat.id,
          name: row.name,
          slug: row.slug,
        });
      }
    }

    for (const r of rawItems) {
      const img = r.imageSlug.toLowerCase();
      const item = toItem(r);
      if (cat.itemScorer(item) > 0 && !serebiiSet.has(img)) {
        missingOnSerebii.push({ category: cat.id, slug: r.slug });
      }
    }
  }

  console.log('=== Serebii lists item, keyword scorer gives 0 (false negatives) ===');
  const byCat = new Map<string, typeof scorerMissesSerebii>();
  for (const row of scorerMissesSerebii) {
    const list = byCat.get(row.category) ?? [];
    list.push(row);
    byCat.set(row.category, list);
  }
  for (const [cat, rows] of [...byCat.entries()].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n${cat} (${rows.length}):`);
    for (const r of rows) console.log(`  - ${r.name} (${r.slug})`);
  }
  console.log(`\nTotal false negatives: ${scorerMissesSerebii.length}`);

  console.log('\n=== Keyword scorer > 0 but not on Serebii category page (possible false positives) ===');
  const byCat2 = new Map<string, typeof missingOnSerebii>();
  for (const row of missingOnSerebii) {
    const list = byCat2.get(row.category) ?? [];
    list.push(row);
    byCat2.set(row.category, list);
  }
  for (const [cat, rows] of [...byCat2.entries()].sort((a, b) => b[1].length - a[1].length)) {
    if (rows.length === 0) continue;
    console.log(`\n${cat} (${rows.length}):`);
    for (const r of rows.slice(0, 40)) console.log(`  - ${r.slug}`);
    if (rows.length > 40) console.log(`  ... +${rows.length - 40} more`);
  }
  console.log(`\nTotal possible false positives: ${missingOnSerebii.length}`);

  if (unmappedSlugs.length) {
    console.log('\n=== Serebii slugs not found in serebii-items.json ===');
    for (const u of unmappedSlugs) console.log(`  ${u.category}: ${u.imageSlug}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
