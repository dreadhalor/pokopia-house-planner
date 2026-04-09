import type { Habitat } from './habitats-parse';
import habitatsJson from './json/habitats.json';

export type { Habitat } from './habitats-parse';

export const habitats = habitatsJson as Habitat[];
