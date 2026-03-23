import * as cheerio from 'cheerio';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');

const SEREBII_BASE = 'https://www.serebii.net';
const ITEMS_URL = `${SEREBII_BASE}/pokemonpokopia/items.shtml`;

const TABLE_CATEGORIES = [
  'Materials',
  'Food',
  'Furniture',
  'Misc',
  'Outdoor',
  'Utilities',
  'Nature',
  'Buildings',
  'Blocks',
  'Kits',
  'Key Items',
  'Other',
];

const KNOWN_TAGS = ['Decoration', 'Food', 'Relaxation', 'Road', 'Toy'];

function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/é/g, 'e')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function toImageSlug(name) {
  return name
    .toLowerCase()
    .replace(/é/g, 'e')
    .replace(/['\u2018\u2019]/g, "'")
    .replace(/ /g, '');
}

function parseLocations(raw) {
  if (!raw) return [];
  const cleaned = raw.replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];

  const locs = cleaned
    .split(/(?<=\))\s*(?=[A-Z])/)
    .flatMap(chunk => {
      if (chunk.includes(')') && !chunk.startsWith('(')) return [chunk];
      return chunk.split(/(?<=[a-z.])\s*(?=(?:Craft|Trade|Appraise|In |Reach |Complete |Inside |Aboard |From |Grow |Take |Charge |PC |Gift|Smelt|Give |Mix |Recycle|Crush |Pokémon Center|Each game))/);
    })
    .map(s => s.trim())
    .filter(Boolean);

  return locs;
}

async function scrapeItems() {
  console.log('Fetching Serebii items page...');
  const resp = await fetch(ITEMS_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const html = await resp.text();
  console.log(`Fetched ${html.length} bytes of HTML`);

  const $ = cheerio.load(html);
  const items = [];

  const tables = $('table.dextable');
  console.log(`Found ${tables.length} dextable tables`);

  tables.each((tableIdx, table) => {
    if (tableIdx >= TABLE_CATEGORIES.length) return;
    const category = TABLE_CATEGORIES[tableIdx];

    const $table = $(table);
    const $rows = $table.find('tr');

    $rows.each((rowIdx, row) => {
      if (rowIdx === 0) return;

      const $row = $(row);
      const $tds = $row.find('td');
      if ($tds.length < 4) return;

      const name = $tds.eq(1).text().trim();
      if (!name) return;

      const imgEl = $tds.eq(0).find('img').first();
      const imgSrc = imgEl.length ? (imgEl.attr('src') || '') : '';
      const imageUrl = imgSrc
        ? (imgSrc.startsWith('http') ? imgSrc : `${SEREBII_BASE}/pokemonpokopia/${imgSrc.replace(/^\//, '')}`)
        : '';

      let description = '';
      let tag = '';
      let locationText = '';

      if ($tds.length >= 5) {
        description = $tds.eq(2).text().trim();
        tag = $tds.eq(3).text().trim();
        locationText = $tds.eq(4).text().trim();
      } else {
        const col2text = $tds.eq(2).text().trim();
        const col3text = $tds.eq(3).text().trim();
        if (KNOWN_TAGS.includes(col2text)) {
          tag = col2text;
          locationText = col3text;
        } else {
          description = col2text;
          locationText = col3text;
        }
      }

      if (!KNOWN_TAGS.includes(tag)) {
        tag = '';
      }

      if (description.startsWith('Note: Not registered in collection')) {
        description = description.replace(/^Note: Not registered in collection\s*/, '');
      }

      const locations = parseLocations(locationText);

      items.push({
        name,
        slug: toSlug(name),
        imageSlug: toImageSlug(name),
        description,
        tag,
        category,
        locations,
        imageUrl,
      });
    });
  });

  console.log(`\nScraped ${items.length} items total`);

  const byCat = {};
  for (const item of items) {
    byCat[item.category] = (byCat[item.category] || 0) + 1;
  }
  console.log('\nBy category:');
  for (const [cat, count] of Object.entries(byCat)) {
    console.log(`  ${cat}: ${count}`);
  }

  const withDesc = items.filter(i => i.description).length;
  const withTag = items.filter(i => i.tag).length;
  const withImg = items.filter(i => i.imageUrl).length;
  console.log(`\nWith descriptions: ${withDesc}/${items.length}`);
  console.log(`With tags: ${withTag}/${items.length}`);
  console.log(`With image URLs: ${withImg}/${items.length}`);

  const seen = new Set();
  const deduped = items.filter(item => {
    const key = `${item.category}::${item.slug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  console.log(`\nAfter dedup: ${deduped.length} items (removed ${items.length - deduped.length} dupes)`);

  const outPath = join(PROJECT_ROOT, 'src/data/raw/serebii-items.json');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(deduped, null, 2));
  console.log(`\nWrote ${outPath}`);

  const imagesDir = join(PROJECT_ROOT, 'public/images/items');
  mkdirSync(imagesDir, { recursive: true });
  const missingImages = deduped.filter(item => {
    const localPath = join(imagesDir, `${item.imageSlug}.png`);
    return !existsSync(localPath);
  });
  console.log(`\nItems missing local images: ${missingImages.length}`);
  if (missingImages.length > 0) {
    console.log('Missing:');
    for (const item of missingImages.slice(0, 30)) {
      console.log(`  ${item.name} -> ${item.imageSlug}.png (serebii: ${item.imageUrl ? 'has URL' : 'NO URL'})`);
    }
    if (missingImages.length > 30) {
      console.log(`  ... and ${missingImages.length - 30} more`);
    }
  }

  const downloadable = missingImages.filter(i => i.imageUrl);
  if (downloadable.length > 0) {
    console.log(`\nDownloading ${downloadable.length} missing images...`);
    let success = 0, fail = 0;
    for (const item of downloadable) {
      const localPath = join(imagesDir, `${item.imageSlug}.png`);
      try {
        const imgResp = await fetch(item.imageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Referer': ITEMS_URL,
          },
        });
        if (imgResp.ok) {
          const buffer = Buffer.from(await imgResp.arrayBuffer());
          writeFileSync(localPath, buffer);
          success++;
        } else {
          console.log(`  FAIL ${imgResp.status}: ${item.name} (${item.imageUrl})`);
          fail++;
        }
      } catch (err) {
        console.log(`  ERROR: ${item.name} - ${err.message}`);
        fail++;
      }
      await new Promise(r => setTimeout(r, 100));
    }
    console.log(`\nDownloaded: ${success} success, ${fail} failed`);
  }

  return deduped;
}

scrapeItems().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
