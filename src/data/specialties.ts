// server-only
import { readFileSync } from 'fs';
import { join } from 'path';

export interface Specialty {
  name: string;
  description: string;
}

function parseSpecialtiesTxt(content: string): Specialty[] {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const tabIndex = line.indexOf('\t');
      if (tabIndex === -1) {
        const spaceIndex = line.indexOf(' ');
        return {
          name: line.slice(0, spaceIndex),
          description: line.slice(spaceIndex + 1),
        };
      }
      return {
        name: line.slice(0, tabIndex),
        description: line.slice(tabIndex + 1),
      };
    });
}

const txtPath = join(process.cwd(), 'src/data/raw/Specialties.txt');
const txtContent = readFileSync(txtPath, 'utf-8');

export const specialties: Specialty[] = parseSpecialtiesTxt(txtContent);
