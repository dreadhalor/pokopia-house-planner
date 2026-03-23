import { router } from '../trpc';
import { pokemonRouter } from './pokemon';
import { habitatRouter } from './habitat';
import { plannerRouter } from './planner';
import { itemsRouter } from './items';
import { favoritesRouter } from './favorites';

export const appRouter = router({
  pokemon: pokemonRouter,
  habitat: habitatRouter,
  planner: plannerRouter,
  items: itemsRouter,
  favorites: favoritesRouter,
});

export type AppRouter = typeof appRouter;
