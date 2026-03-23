// server-only
import { readFileSync } from 'fs';
import { join } from 'path';

export interface Habitat {
  id: string;
  name: string;
  description: string;
  isEvent: boolean;
}

function parseHabitatsMd(content: string): Habitat[] {
  const habitats: Habitat[] = [];
  let inEventSection = false;

  for (const line of content.split('\n')) {
    const trimmed = line.trim();

    if (trimmed.startsWith('## Event Habitats')) {
      inEventSection = true;
      continue;
    }

    if (!trimmed.startsWith('|') || trimmed.startsWith('| #') || trimmed.startsWith('|--')) {
      continue;
    }

    const cells = trimmed
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean);

    if (cells.length < 3) continue;

    const rawId = cells[0];
    if (rawId === '#' || rawId === '---') continue;

    habitats.push({
      id: rawId,
      name: cells[1],
      description: cells.slice(2).join(' | '),
      isEvent: inEventSection,
    });
  }

  return habitats;
}

const mdPath = join(process.cwd(), 'src/data/raw/Habitats.md');
const mdContent = readFileSync(mdPath, 'utf-8');

export const habitats: Habitat[] = parseHabitatsMd(mdContent);
