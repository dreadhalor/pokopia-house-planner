import type { Specialty } from './specialties-parse';
import specialtiesJson from './json/specialties.json';

export type { Specialty } from './specialties-parse';

export const specialties = specialtiesJson as Specialty[];
