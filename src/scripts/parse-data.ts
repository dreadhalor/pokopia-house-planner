import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { pokemon } from '../data/pokemon';
import { habitats } from '../data/habitats';
import { specialties } from '../data/specialties';
import { food } from '../data/food';

const outDir = join(process.cwd(), 'src/data/json');
mkdirSync(outDir, { recursive: true });

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
