/** Specialties.txt → records (used by `parse-data` script; runtime uses `specialties.json`). */

export interface Specialty {
  name: string;
  description: string;
}

export function parseSpecialtiesTxt(content: string): Specialty[] {
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
