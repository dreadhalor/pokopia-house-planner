import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { parsePokemonCSV } from '../data/pokemon-parse';
import { parseHabitatsMd } from '../data/habitats-parse';
import { parseSpecialtiesTxt } from '../data/specialties-parse';
import { food } from '../data/food';

const outDir = join(process.cwd(), 'src/data/json');
mkdirSync(outDir, { recursive: true });

const csvPath = join(process.cwd(), 'src/data/raw/Pokopia.csv');
const pokemon = parsePokemonCSV(readFileSync(csvPath, 'utf-8'));

const mdPath = join(process.cwd(), 'src/data/raw/Habitats.md');
const habitats = parseHabitatsMd(readFileSync(mdPath, 'utf-8'));

const txtPath = join(process.cwd(), 'src/data/raw/Specialties.txt');
const specialties = parseSpecialtiesTxt(readFileSync(txtPath, 'utf-8'));

writeFileSync(
  join(outDir, 'pokemon.json'),
  JSON.stringify(pokemon, null, 2),
);
writeFileSync(
  join(outDir, 'habitats.json'),
  JSON.stringify(habitats, null, 2),
);
writeFileSync(
  join(outDir, 'specialties.json'),
  JSON.stringify(specialties, null, 2),
);
writeFileSync(join(outDir, 'food.json'), JSON.stringify(food, null, 2));

console.log('Parsed data written to src/data/json/');
console.log(`  Pokemon: ${pokemon.length}`);
console.log(`  Habitats: ${habitats.length}`);
console.log(`  Specialties: ${specialties.length}`);
console.log(`  Food items: ${food.length}`);
