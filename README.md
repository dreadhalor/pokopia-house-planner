# Pokopia House Planner

**Pokémon Pokopia — town and roommate planner.** Split your roster into same-habitat houses, maximize overlap on favorites, and get furnishing suggestions (with Serebii-backed lists where available). Pokédex, items, and habitats are **reference** helpers for planning, not a replacement for [Serebii’s Pokopia section](https://www.serebii.net/pokemonpokopia/).

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the planner. `/planner` redirects to `/`. Town saves live in `localStorage` under `pokopia-house-planner-towns-v1` (one-time migration from `nestmate-towns-v1` or `pokopedia-towns-v1` if present).

## Scripts

- `npm run build:serebii-favorites` — refresh `src/data/raw/serebii-favorite-items-by-category.json` from Serebii favorites pages (official-vs-guess labels in the planner).

Fan project; not affiliated with Nintendo, Game Freak, or The Pokémon Company.
