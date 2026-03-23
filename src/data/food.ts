export interface FoodItem {
  name: string;
  category: 'berry' | 'ingredient' | 'cooked' | 'drink' | 'special';
  boosts: string;
  flavor: string;
  description: string;
  locations?: string[];
}

export const food: FoodItem[] = [
  // --- Berries ---
  {
    name: 'Leppa Berry',
    category: 'berry',
    boosts: 'Restore PP',
    flavor: '',
    description:
      'A berry with a rather unremarkable flavor. Restores some PP when eaten.',
    locations: [
      'Withered Wastelands (Natural)',
      'Bleak Beach (Natural)',
      'Rocky Ridges (Natural)',
      'Sparkling Skylands (Natural)',
    ],
  },
  {
    name: 'Chesto Berry',
    category: 'berry',
    boosts: 'Restore PP',
    flavor: 'Dry',
    description:
      'A rock-hard berry with a dry flavor. Restores some PP when eaten.',
  },
  {
    name: 'Rawst Berry',
    category: 'berry',
    boosts: 'Restore PP',
    flavor: 'Bitter',
    description:
      'The longer and more curled the leaves are, the more bitter this berry tastes. Restores some PP when eaten.',
  },
  {
    name: 'Aspear Berry',
    category: 'berry',
    boosts: 'Restore PP',
    flavor: 'Sour',
    description:
      'This berry has a distinctively sharp sour taste. Restores some PP when eaten.',
  },
  {
    name: 'Pecha Berry',
    category: 'berry',
    boosts: 'Restore PP',
    flavor: 'Sweet',
    description: 'A sweet, delicious berry. Restores some PP when eaten.',
  },
  {
    name: 'Lum Berry',
    category: 'berry',
    boosts: 'Restore PP',
    flavor: '',
    description:
      'A berry that has a well-balanced flavor. Restores some PP when eaten.',
  },

  // --- Raw Ingredients ---
  {
    name: 'Bean',
    category: 'ingredient',
    boosts: 'Restore PP',
    flavor: '',
    description:
      'Small beans that are jam-packed with nutrients. Restores some PP when eaten.',
    locations: ['Rocky Ridges (Natural)', 'Sparkling Skylands (Natural)'],
  },
  {
    name: 'Tomato',
    category: 'ingredient',
    boosts: 'Restore PP',
    flavor: '',
    description:
      'A round, tasty-looking tomato. Restores some PP when eaten.',
    locations: ['Sparkling Skylands (Natural)'],
  },
  {
    name: 'Wheat',
    category: 'ingredient',
    boosts: 'Restore PP',
    flavor: '',
    description:
      "They're actually edible raw! Restores some PP when eaten.",
    locations: ['Rocky Ridges (Natural)', 'Sparkling Skylands (Natural)'],
  },
  {
    name: 'Potato',
    category: 'ingredient',
    boosts: 'Restore PP',
    flavor: '',
    description:
      'A delicious potato—even with the skin still on! Restores some PP when eaten.',
  },
  {
    name: 'Fresh carrot',
    category: 'ingredient',
    boosts: 'Restore PP',
    flavor: '',
    description:
      'You can harvest these spicy carrots by pulling up on their leaves. Restores some PP when eaten.',
    locations: ['Withered Wastelands (Natural)', 'Palette Town (Natural)'],
  },
  {
    name: 'Seaweed',
    category: 'ingredient',
    boosts: 'Restore PP',
    flavor: '',
    description:
      'Seaweed that has washed ashore. Restores some PP when eaten.',
    locations: ['Bleak Beach (Natural)', 'Palette Town (Natural)'],
  },
  {
    name: 'Cave mushrooms',
    category: 'ingredient',
    boosts: 'Restore PP',
    flavor: '',
    description:
      'Mushrooms that grow in damp places such as caves or under shady trees. Restores some PP when eaten.',
    locations: ['Rocky Ridges (Natural)'],
  },

  // --- Cooked: Salads (boost Leafage) ---
  {
    name: 'Simple salad',
    category: 'cooked',
    boosts: 'Leafage',
    flavor: '',
    description:
      'An ordinary salad made with leaves. Powers up Leafage when eaten.',
  },
  {
    name: 'Leppa salad',
    category: 'cooked',
    boosts: 'Leafage',
    flavor: 'Sweet',
    description:
      'A sweet salad made with Leppa Berries. Powers up Leafage when eaten.',
  },
  {
    name: 'Seaweed salad',
    category: 'cooked',
    boosts: 'Leafage',
    flavor: 'Bitter',
    description:
      'A bitter-tasting salad made with seaweed. Powers up Leafage when eaten.',
  },
  {
    name: 'Shredded salad',
    category: 'cooked',
    boosts: 'Leafage',
    flavor: 'Sour',
    description:
      'A sour salad made with finely chopped leaves. Powers up Leafage when eaten.',
  },
  {
    name: 'Crushed-berry salad',
    category: 'cooked',
    boosts: 'Leafage',
    flavor: 'Dry',
    description:
      'A salad with a dry flavor, made with crushed Chesto Berries. Powers up Leafage when eaten.',
  },
  {
    name: 'Crouton salad',
    category: 'cooked',
    boosts: 'Leafage',
    flavor: 'Spicy',
    description:
      'A spicy salad with a delightfully crunchy texture. Powers up Leafage when eaten.',
  },

  // --- Cooked: Soups (boost Water Gun) ---
  {
    name: 'Simple soup',
    category: 'cooked',
    boosts: 'Water Gun',
    flavor: '',
    description:
      'An ordinary soup made with Fresh Water. Powers up Water Gun when eaten.',
  },
  {
    name: 'Seaweed soup',
    category: 'cooked',
    boosts: 'Water Gun',
    flavor: 'Bitter',
    description:
      'A bitter-tasting soup made with seaweed. Powers up Water Gun when eaten.',
  },
  {
    name: 'Mushroom soup',
    category: 'cooked',
    boosts: 'Water Gun',
    flavor: 'Dry',
    description:
      'A soup with a dry flavor made with mushroom broth. Powers up Water Gun when eaten.',
  },
  {
    name: 'Electrifying soup',
    category: 'cooked',
    boosts: 'Water Gun',
    flavor: 'Spicy',
    description:
      'A shockingly spicy soup. Powers up Water Gun when eaten.',
  },
  {
    name: 'Healthy soup',
    category: 'cooked',
    boosts: 'Water Gun',
    flavor: 'Spicy',
    description:
      'A spicy soup with an aromatic bean flavor. Powers up Water Gun when eaten.',
  },
  {
    name: 'Flavorful soup',
    category: 'cooked',
    boosts: 'Water Gun',
    flavor: 'Sour',
    description:
      'A sour soup bursting with flavor. Powers up Water Gun when eaten.',
  },

  // --- Cooked: Breads (boost Cut) ---
  {
    name: 'Simple bread',
    category: 'cooked',
    boosts: 'Cut',
    flavor: '',
    description: 'Ordinary wheat bread. Powers up Cut when eaten.',
  },
  {
    name: 'Leppa bread',
    category: 'cooked',
    boosts: 'Cut',
    flavor: 'Sour',
    description:
      'Sour-tasting bread made with Leppa Berry jam. Powers up Cut when eaten.',
  },
  {
    name: 'Carrot bread',
    category: 'cooked',
    boosts: 'Cut',
    flavor: 'Spicy',
    description:
      'Spicy bread with an intense carrot flavor. Powers up Cut when eaten.',
  },
  {
    name: 'Recycled bread',
    category: 'cooked',
    boosts: 'Cut',
    flavor: 'Bitter',
    description:
      'Bitter-tasting bread made by reusing other bread. Powers up Cut when eaten.',
  },
  {
    name: 'Fluffy bread',
    category: 'cooked',
    boosts: 'Cut',
    flavor: 'Sweet',
    description:
      'Sweet bread made with Pecha Berries. Powers up Cut when eaten.',
  },
  {
    name: 'Bread bowl',
    category: 'cooked',
    boosts: 'Cut',
    flavor: 'Spicy',
    description:
      "Spicy bread that's delicious even when burnt. Powers up Cut when eaten.",
  },

  // --- Cooked: Hamburger Steaks (boost Rock Smash) ---
  {
    name: 'Simple hamburger steak',
    category: 'cooked',
    boosts: 'Rock Smash',
    flavor: '',
    description:
      'An ordinary hamburger steak, made with beans. Powers up Rock Smash when eaten.',
  },
  {
    name: 'Mushroom hamburger steak',
    category: 'cooked',
    boosts: 'Rock Smash',
    flavor: 'Dry',
    description:
      'A hamburger steak with an intensely dry, mushroomy flavor. Powers up Rock Smash when eaten.',
  },
  {
    name: 'Tomato hamburger steak',
    category: 'cooked',
    boosts: 'Rock Smash',
    flavor: 'Sour',
    description:
      'A hamburger steak that brings out the sour flavor of its ingredients. Powers up Rock Smash when eaten.',
  },
  {
    name: 'Potato hamburger steak',
    category: 'cooked',
    boosts: 'Rock Smash',
    flavor: 'Sweet',
    description:
      'A satisfyingly sweet hamburger steak. Powers up Rock Smash a lot when eaten.',
  },
  {
    name: 'Bitter hamburger steak',
    category: 'cooked',
    boosts: 'Rock Smash',
    flavor: 'Bitter',
    description:
      'A bitter-tasting hamburger steak topped with leaves. Powers up Rock Smash when eaten.',
  },
  {
    name: 'Vibrant hamburger steak',
    category: 'cooked',
    boosts: 'Rock Smash',
    flavor: '',
    description:
      'A hamburger steak made with lots of ingredients. Powers up Rock Smash a lot when eaten.',
  },

  // --- Drinks ---
  {
    name: 'Fresh Water',
    category: 'drink',
    boosts: 'Liquid (Water)',
    flavor: '',
    description:
      "Delicious water that's perfect for making soup. Drink some and spit it out to make things wet.",
  },
  {
    name: 'Soda Pop',
    category: 'drink',
    boosts: 'Liquid (Seawater)',
    flavor: '',
    description:
      'Fizzy, sparkling soda. If you take a sip and spit it out, it becomes seawater.',
  },
  {
    name: 'Moomoo Milk Coffee',
    category: 'drink',
    boosts: 'Liquid (Muddy water)',
    flavor: '',
    description:
      'Milky coffee with a comfortingly sweet taste. If you take a sip and spit it out, it becomes muddy water!',
  },
  {
    name: 'Roserade Tea',
    category: 'drink',
    boosts: 'Liquid (Hot spring)',
    flavor: '',
    description:
      'Tea with a delicate, elegant aroma. If you take a sip and spit it out, it becomes a hot spring!',
  },
  {
    name: 'Chili sauce',
    category: 'drink',
    boosts: 'Liquid (Lava)',
    flavor: '',
    description:
      'Sauce with an enticingly spicy flavor. If you take a sip and spit it out, it becomes lava!',
  },

  // --- Special ---
  {
    name: 'Bruised berry',
    category: 'special',
    boosts: 'Restore PP (small)',
    flavor: '',
    description:
      'A bruised berry you got from Chef Dente. Restores a bit of PP when eaten.',
  },
  {
    name: 'Common candy',
    category: 'special',
    boosts: 'Restore PP',
    flavor: '',
    description:
      'A piece of candy you got from Chef Dente. Restores some PP when eaten.',
  },
  {
    name: 'Curry and rice',
    category: 'special',
    boosts: 'Party food',
    flavor: '',
    description:
      'An absolutely essential meal for any party. Enjoy some tasty food alongside other Pokémon!',
  },
];

export function getFoodByFlavor(flavor: string): FoodItem[] {
  const key = flavor
    .replace(/ flavors?$/i, '')
    .trim()
    .toLowerCase();
  return food.filter(
    (f) =>
      f.flavor.toLowerCase() === key &&
      f.category === 'cooked',
  );
}

export function getFoodByCategory(
  category: FoodItem['category'],
): FoodItem[] {
  return food.filter((f) => f.category === category);
}

export const FOOD_CATEGORIES = [
  'berry',
  'ingredient',
  'cooked',
  'drink',
  'special',
] as const;

export const FOOD_CATEGORY_LABELS: Record<string, string> = {
  berry: 'Berries',
  ingredient: 'Raw Ingredients',
  cooked: 'Cooked Meals',
  drink: 'Drinks',
  special: 'Special',
};
