// server-only
import { readFileSync } from 'fs';
import { join } from 'path';

export interface Item {
  name: string;
  slug: string;
  description: string;
  tag: string;
  category: string;
  locations: string[];
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/é/g, 'e')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function toImageSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/é/g, 'e')
    .replace(/['\u2018\u2019]/g, "'")
    .replace(/ /g, '');
}

interface RawSerebiiItem {
  name: string;
  slug: string;
  imageSlug: string;
  description: string;
  tag: string;
  category: string;
  locations: string[];
  imageUrl: string;
}

const jsonPath = join(process.cwd(), 'src/data/raw/serebii-items.json');
const rawItems: RawSerebiiItem[] = JSON.parse(readFileSync(jsonPath, 'utf-8'));

export const items: Item[] = rawItems.map((raw) => ({
  name: raw.name,
  slug: raw.slug,
  description: raw.description,
  tag: raw.tag,
  category: raw.category,
  locations: raw.locations,
}));

export function getItemBySlug(slug: string): Item | undefined {
  return items.find((i) => i.slug === slug);
}

export function getItemsByCategory(category: string): Item[] {
  return items.filter((i) => i.category === category);
}

export function getItemImagePath(item: Item): string {
  return `/images/items/${toImageSlug(item.name)}.png`;
}

export const ITEM_CATEGORIES = [
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
] as const;

export const ITEM_TAGS = [
  'Decoration',
  'Food',
  'Relaxation',
  'Road',
  'Toy',
] as const;

export { toSlug, toImageSlug };
