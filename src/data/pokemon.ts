import type { Pokemon } from './pokemon-parse';
import pokemonJson from './json/pokemon.json';

export type { Pokemon } from './pokemon-parse';

export const pokemon = pokemonJson as Pokemon[];
