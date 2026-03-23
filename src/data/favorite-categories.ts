import type { Item } from './items';

/**
 * Item-to-favorite membership here is keyword-based (name + description), i.e. an
 * educated guess for UX and planner scoring. For ground truth, Serebii’s per-category
 * favorites pages are treated as official documentation, though some pages are still
 * incomplete or work in progress.
 */
export interface FavoriteCategory {
  id: string;
  name: string;
  description: string;
  examples: string[];
  itemScorer: (item: Item) => number;
}

function scoreNameOrDesc(item: Item, ...keywords: string[]): number {
  const name = item.name.toLowerCase();
  const desc = (item.description ?? '').toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    const k = kw.toLowerCase();
    if (name.includes(k)) score += 10;
    else if (desc.includes(k)) score += 3;
  }
  return score;
}

function scoreNameOnly(item: Item, ...keywords: string[]): number {
  const name = item.name.toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    if (name.includes(kw.toLowerCase())) score += 10;
  }
  return score;
}

const CATEGORY_BONUS = 15;

export const favoriteCategories: FavoriteCategory[] = [
  {
    id: 'strange-stuff',
    name: 'Strange stuff',
    description:
      'Items that are unusual, quirky, or mysterious in nature. Pokémon with this preference are drawn to the bizarre and unexplainable.',
    examples: [
      'Crystal ball',
      'Boo-in-the-box',
      'Wobbuffet Wobbler',
      'Science experiment',
      'Mysterious statue',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(
        item,
        'mysterious',
        'strange',
        'funky',
        'weird',
        'crystal ball',
        'boo-in-the-box',
        'wobbuffet wobbler',
        'spell tag',
        'ditto doll',
        'substitute doll',
        'science experiment',
        'microscope',
        'fortune',
        'spacesuit',
        'spaceship',
        'space shuttle',
        'arcade machine',
        'fossil',
        'mysterious slate',
      ),
  },
  {
    id: 'soft-stuff',
    name: 'Soft stuff',
    description:
      'Items made of plush, cushioned, or otherwise soft materials. Perfect for Pokémon that love comfort and coziness.',
    examples: [
      'Cute sofa',
      'Fluffy bread',
      'Simple cushion',
      'Fluffy flooring',
      'Plain bed',
      'Soft mat',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(
        item,
        'soft',
        'fluffy',
        'cushion',
        'pillow',
        'plush',
        'cotton',
        'felt mat',
        'carpet',
      ) +
      scoreNameOnly(item, 'bed', 'sofa', 'hammock'),
  },
  {
    id: 'wobbly-stuff',
    name: 'Wobbly stuff',
    description:
      'Items that wobble, bounce, jiggle, or are gelatinous. Pokémon with this preference enjoy unstable and springy objects.',
    examples: [
      'Wobbuffet Wobbler',
      'Bouncy blue bathtub',
      'Punching bag',
      'Ditto doll',
      'Inflatable boat',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(
        item,
        'wobbly',
        'wobbler',
        'bouncy',
        'inflatable',
        'spring',
        'jiggle',
        'punching bag',
        'ditto doll',
        'balloon',
      ),
  },
  {
    id: 'hard-stuff',
    name: 'Hard stuff',
    description:
      'Items made of sturdy, solid, or rigid materials like stone and iron. Appeals to Pokémon that appreciate toughness and durability.',
    examples: [
      'Stone table',
      'Iron chair',
      'Metal fencing',
      'Stone steps',
      'Large boulder',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(item, 'sturdy', 'solid', 'hard', 'rigid') +
      scoreNameOnly(
        item,
        'stone table',
        'stone bench',
        'iron chair',
        'iron bench',
        'large boulder',
        'concrete',
        'brick',
      ),
  },
  {
    id: 'round-stuff',
    name: 'Round stuff',
    description:
      'Spherical, circular, or rounded items. Pokémon with this preference are attracted to smooth, ball-shaped objects.',
    examples: [
      'Poké Ball',
      'Crystal ball',
      'Balloons',
      'Berry basket',
      'Model planet',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(item, 'ball', 'round', 'sphere', 'circular', 'globe') +
      scoreNameOnly(item, 'balloon', 'model planet', 'mirror ball'),
  },
  {
    id: 'sharp-stuff',
    name: 'Sharp stuff',
    description:
      'Items with pointed edges, spikes, or angular features. Pokémon with this preference like things that are prickly or jagged.',
    examples: [
      'Iron pipes',
      'Arrow sign',
      'Icicle',
      'Metal fencing',
      'Stalactites',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(item, 'sharp', 'spike', 'pointed', 'jagged', 'prickly') +
      scoreNameOnly(
        item,
        'icicle',
        'stalactite',
        'stalagmite',
        'arrow sign',
        'iron pipe',
        'sharp beak',
      ),
  },
  {
    id: 'shiny-stuff',
    name: 'Shiny stuff',
    description:
      'Items that sparkle, shimmer, or reflect light. Pokémon with this preference are drawn to gleaming and luminous objects.',
    examples: [
      'Mirror ball',
      'Crystal wall',
      'Glass window',
      'Gold ingot',
      'Stardust',
      'String lights',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(
        item,
        'shiny',
        'sparkle',
        'shimmer',
        'glitter',
        'gleam',
        'lustrous',
        'luminous',
        'glowing',
        'stardust',
        'mirror ball',
        'crystal',
        'string lights',
        'gold',
      ),
  },
  {
    id: 'cute-stuff',
    name: 'Cute stuff',
    description:
      'Adorable, charming, and kawaii-style items. Pokémon with this preference love pastel colors and lovable designs.',
    examples: [
      'Cute table',
      'Cute chair',
      'Cute bed',
      'Eevee doll',
      'Pikachu doll',
      'Clefairy doll',
    ],
    itemScorer: (item) =>
      scoreNameOnly(item, 'cute', 'adorable') +
      scoreNameOrDesc(item, 'eevee doll', 'pikachu doll', 'clefairy doll'),
  },
  {
    id: 'spooky-stuff',
    name: 'Spooky stuff',
    description:
      'Dark, ghostly, and eerie items with a haunted atmosphere. Pokémon with this preference enjoy creepy and unsettling décor.',
    examples: [
      'Gravestone',
      'Eerie candle',
      'Spell Tag',
      'Boo-in-the-box',
      'Skull Fossil',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(
        item,
        'spooky',
        'eerie',
        'ghost',
        'haunted',
        'creepy',
        'skull',
        'gravestone',
        'boo-in-the-box',
        'malicious',
      ),
  },
  {
    id: 'blocky-stuff',
    name: 'Blocky stuff',
    description:
      'Block-shaped, cubic, or boxy items. Pokémon with this preference like stacking and arranging geometric shapes.',
    examples: [
      'Toy blocks',
      'Cube light',
      'Scrap cube',
      'Cardboard boxes',
      'Storage Box',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(item, 'block', 'cube', 'box', 'crate', 'cubic'),
  },
  {
    id: 'slender-objects',
    name: 'Slender objects',
    description:
      'Long, thin, and narrow items. Pokémon with this preference are attracted to sleek and elongated objects.',
    examples: [
      'Slender candle',
      'Iron pipes',
      'Rope',
      'Fishing rod',
      'Perch',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(item, 'slender', 'narrow', 'thin', 'elongated') +
      scoreNameOnly(
        item,
        'rope',
        'rod',
        'perch',
        'pole',
        'wire',
        'chain',
        'pipe',
        'candle',
      ),
  },
  {
    id: 'colorful-stuff',
    name: 'Colorful stuff',
    description:
      'Brightly colored, multi-hued, or vividly patterned items. Pokémon with this preference enjoy lively and eye-catching décor.',
    examples: [
      'Paint balloons',
      'Pop art furniture',
      'Party bunting',
      'Fireworks',
      'Colorful prints',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(item, 'colorful', 'vibrant', 'vivid', 'rainbow') +
      scoreNameOnly(item, 'paint balloon', 'firework', 'pop art', 'party bunting'),
  },
  {
    id: 'glass-stuff',
    name: 'Glass stuff',
    description:
      'Items made of glass or crystal. Pokémon with this preference enjoy transparent, fragile, and elegant objects.',
    examples: [
      'Glass window',
      'Sea glass fragments',
      'Stained-glass window',
      'Crystal ball',
      'Crystal wall',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(item, 'glass', 'crystal', 'transparent', 'stained-glass'),
  },
  {
    id: 'metal-stuff',
    name: 'Metal stuff',
    description:
      'Items forged from metal or iron. Pokémon with this preference like industrial, tough, and metallic objects.',
    examples: [
      'Iron table',
      'Metal fencing',
      'Iron pipes',
      'Smelting furnace',
      'Metal drum',
    ],
    itemScorer: (item) =>
      scoreNameOnly(item, 'iron', 'metal', 'steel', 'copper', 'bronze') +
      scoreNameOrDesc(item, 'smelting', 'metallic', 'ingot'),
  },
  {
    id: 'stone-stuff',
    name: 'Stone stuff',
    description:
      'Items carved or built from stone and rock. Pokémon with this preference appreciate sturdy, earthy, and ancient-feeling objects.',
    examples: [
      'Stone table',
      'Gravestone',
      'Stone steps',
      'Large boulder',
      'Stone fireplace',
    ],
    itemScorer: (item) =>
      scoreNameOnly(item, 'stone', 'rock', 'boulder', 'cliff', 'limestone') +
      scoreNameOrDesc(item, 'cobblestone'),
  },
  {
    id: 'wooden-stuff',
    name: 'Wooden stuff',
    description:
      'Items crafted from wood or timber. Pokémon with this preference are drawn to natural, rustic, and warm furnishings.',
    examples: [
      'Wooden table',
      'Log Bed',
      'Wooden bench',
      'Wooden crate',
      'Driftwood',
    ],
    itemScorer: (item) =>
      scoreNameOnly(item, 'wooden', 'log ', 'wood', 'lumber', 'driftwood'),
  },
  {
    id: 'nice-breezes',
    name: 'Nice breezes',
    description:
      'Items that create or channel airflow and wind. Pokémon with this preference enjoy feeling a refreshing breeze.',
    examples: [
      'Fan',
      'Ceiling fan',
      'Beach parasol',
      'Weather vane',
      'Windmill',
      'Large ventilation fan',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(item, 'breeze', 'wind', 'ventilation', 'weather vane') +
      scoreNameOnly(item, 'fan', 'parasol', 'windmill', 'pinwheel'),
  },
  {
    id: 'lots-of-nature',
    name: 'Lots of nature',
    description:
      'Natural items like plants, trees, and greenery. Pokémon with this preference thrive around living things and lush environments.',
    examples: [
      'Leppa tree',
      'Tall grass',
      'Fern',
      'Moss',
      'Planter',
      'Dense vines',
    ],
    itemScorer: (item) =>
      scoreNameOnly(
        item,
        'tree',
        'grass',
        'fern',
        'moss',
        'vine',
        'planter',
        'shoots',
        'flower',
        'hedge',
        'seeds',
        'duckweed',
      ) + (item.category === 'Nature' ? CATEGORY_BONUS : 0),
  },
  {
    id: 'lots-of-water',
    name: 'Lots of water',
    description:
      'Water features and aquatic-themed items. Pokémon with this preference love being around bodies of water and wet environments.',
    examples: [
      'Water basin',
      'Hot-spring spout',
      'Canoe',
      'Inflatable boat',
      'Sprinkler',
      'Horsea fountain',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(
        item,
        'water',
        'fountain',
        'sprinkler',
        'hot-spring',
        'floodgate',
      ) + scoreNameOnly(item, 'canoe', 'boat', 'bathtub', 'shower'),
  },
  {
    id: 'lots-of-fire',
    name: 'Lots of fire',
    description:
      'Fire sources and flame-themed items. Pokémon with this preference are drawn to warmth, embers, and open flames.',
    examples: [
      'Campfire',
      'Torch',
      'Firepit',
      'Bonfire',
      'Charcoal',
      'Smelting furnace',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(item, 'fire', 'flame', 'torch', 'campfire', 'bonfire') +
      scoreNameOnly(item, 'firepit', 'furnace', 'charcoal', 'candle', 'lava'),
  },
  {
    id: 'lots-of-dirt',
    name: 'Lots of dirt',
    description:
      'Earthy, soil-based, and ground-related items. Pokémon with this preference enjoy digging around in dirt and natural terrain.',
    examples: [
      'Ordinary soil',
      'Clay',
      'Sand',
      'Gravel',
      'Mud',
      'Farm soil',
    ],
    itemScorer: (item) =>
      scoreNameOnly(item, 'soil', 'clay', 'sand', 'gravel', 'mud', 'dirt'),
  },
  {
    id: 'ocean-vibes',
    name: 'Ocean vibes',
    description:
      'Beach and ocean-themed items that evoke a seaside atmosphere. Pokémon with this preference love coastal and tropical décor.',
    examples: [
      'Beach parasol',
      'Beach chair',
      'Canoe',
      'Seashell',
      'Shell lamp',
      'Driftwood',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(
        item,
        'beach',
        'ocean',
        'sea',
        'harbor',
        'shore',
        'coastal',
        'tropical',
        'resort',
        'driftwood',
        'shell',
        'canoe',
        'boat',
        'anchor',
        'fishing',
      ),
  },
  {
    id: 'pretty-flowers',
    name: 'Pretty flowers',
    description:
      'Floral items and flower arrangements. Pokémon with this preference are charmed by blossoms, petals, and botanical beauty.',
    examples: [
      'Wildflowers',
      'Beautiful flower',
      'Cute flower',
      'Elegant flower',
      'Flower print',
      'Extravagant flowers',
    ],
    itemScorer: (item) => scoreNameOnly(item, 'flower', 'floral', 'blossom'),
  },
  {
    id: 'cleanliness',
    name: 'Cleanliness',
    description:
      'Cleaning supplies and hygiene-related items. Pokémon with this preference value tidiness and a spotless environment.',
    examples: [
      'Cleaning supplies',
      'Shower',
      'Bathtub',
      'Sink',
      'Washing machine',
      'Towel rack',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(item, 'clean', 'wash', 'shower', 'bath', 'towel', 'soap') +
      scoreNameOnly(item, 'sink', 'toilet'),
  },
  {
    id: 'exercise',
    name: 'Exercise',
    description:
      'Fitness equipment and physical activity items. Pokémon with this preference enjoy working out and staying active.',
    examples: [
      'Punching bag',
      'Punching game',
      'Tire toy',
      'Bike',
      'Slide',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(item, 'exercise', 'fitness', 'workout', 'punch') +
      scoreNameOnly(item, 'bike', 'tire toy', 'slide'),
  },
  {
    id: 'play-spaces',
    name: 'Play spaces',
    description:
      'Toys, games, and playground items for fun and recreation. Pokémon with this preference love playing and having a good time.',
    examples: [
      'Slide',
      'Tire toy',
      'Toy blocks',
      'Game Boy system',
      'Arcade machine',
      'Pinwheels',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(item, 'toy', 'game', 'play', 'arcade', 'sandbox') +
      scoreNameOnly(item, 'slide', 'pinwheel'),
  },
  {
    id: 'noisy-stuff',
    name: 'Noisy stuff',
    description:
      'Items that produce sound, music, or noise. Pokémon with this preference are attracted to loud and lively environments.',
    examples: [
      'Speaker',
      'Big drum',
      'Standing mic',
      'Cool electric guitar',
      'Music mats',
      'Bell',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(
        item,
        'music',
        'speaker',
        'drum',
        'guitar',
        'bass',
        'mic',
        'noise',
        'bell',
        'alarm',
        'audio',
      ) + scoreNameOnly(item, 'cd player'),
  },
  {
    id: 'gatherings',
    name: 'Gatherings',
    description:
      'Items for hosting parties and social events. Pokémon with this preference enjoy festive settings and celebrations.',
    examples: [
      'Party platter',
      'Party bunting',
      'Party Popper',
      'Table setting',
      'Folding chair',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(item, 'party', 'gathering', 'celebration', 'festive') +
      scoreNameOnly(item, 'bunting', 'popper'),
  },
  {
    id: 'group-activities',
    name: 'Group activities',
    description:
      'Items designed for collaborative play and shared experiences. Pokémon with this preference love doing things together with others.',
    examples: [
      'Concert stage kit',
      'Small stage',
      'Handcar',
      'Railway track',
      'Slide',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(item, 'stage', 'concert', 'spectator') +
      scoreNameOnly(item, 'handcar', 'railway', 'elevator platform'),
  },
  {
    id: 'healing',
    name: 'Healing',
    description:
      'Recovery and health-related items. Pokémon with this preference are drawn to soothing and restorative environments.',
    examples: [
      'First aid kit',
      'Pokémon Center counter',
      'Leppa Berry',
      'Hot-spring spout',
      'Potion',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(
        item,
        'heal',
        'first aid',
        'potion',
        'restore',
        'recovery',
        'hot-spring',
      ) + scoreNameOnly(item, 'pokémon center', 'berry'),
  },
  {
    id: 'rides',
    name: 'Rides',
    description:
      'Rideable and transportation-themed items. Pokémon with this preference enjoy hopping on and going for a ride.',
    examples: [
      'Bike',
      'Handcar',
      'Cart',
      'Canoe',
      'Inflatable boat',
      'Elevator platform',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(item, 'ride', 'vehicle') +
      scoreNameOnly(
        item,
        'bike',
        'handcar',
        'cart',
        'canoe',
        'boat',
        'elevator',
        'lift platform',
      ),
  },
  {
    id: 'symbols',
    name: 'Symbols',
    description:
      'Symbolic, emblematic, and meaningful decorative items. Pokémon with this preference appreciate icons and cultural artifacts.',
    examples: [
      'Gym emblem statue',
      'Badges',
      'Mysterious Slates',
      'Hanging scroll',
      'Town map',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(item, 'emblem', 'badge', 'symbol', 'slate', 'scroll') +
      scoreNameOnly(item, 'town map', 'flag', 'banner'),
  },
  {
    id: 'letters-and-words',
    name: 'Letters and words',
    description:
      'Text, books, and reading materials. Pokémon with this preference enjoy written words and informational items.',
    examples: [
      'Book',
      'Open Book',
      'Newspaper',
      'Sign',
      'Signpost',
      'Information board',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(item, 'book', 'letter', 'newspaper', 'notepad', 'written') +
      scoreNameOnly(item, 'sign', 'signpost', 'information board', 'papers'),
  },
  {
    id: 'watching-stuff',
    name: 'Watching stuff',
    description:
      'Screens, artwork, and visual displays for viewing. Pokémon with this preference enjoy watching and observing things.',
    examples: [
      'Television',
      'Wall monitor',
      'Telescope',
      'Painting',
      'Photo frame',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(item, 'monitor', 'television', 'screen', 'telescope') +
      scoreNameOnly(item, 'painting', 'photo frame', 'poster', 'canvas'),
  },
  {
    id: 'spinning-stuff',
    name: 'Spinning stuff',
    description:
      'Items that spin or rotate. Pokémon with this preference are mesmerized by circular motion.',
    examples: [
      'Pinwheels',
      'Ceiling fan',
      'Fan',
      'Weather vane',
      'Mirror ball',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(item, 'spin', 'rotate', 'swivel', 'pinwheel', 'windmill') +
      scoreNameOnly(item, 'fan', 'weather vane', 'mirror ball', "ship's wheel"),
  },
  {
    id: 'complicated-stuff',
    name: 'Complicated stuff',
    description:
      'Complex, mechanical, and high-tech items. Pokémon with this preference are fascinated by intricate gadgets and machinery.',
    examples: [
      'Control unit',
      'Computer',
      'Gaming PC',
      'Science experiment',
      'Microscope',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(
        item,
        'control unit',
        'computer',
        'experiment',
        'microscope',
        'machine',
        'generator',
        'sensor',
        'camera',
        'switch',
        'transmitter',
      ) + scoreNameOnly(item, 'gaming pc', 'laptop', 'tablet', 'printer'),
  },
  {
    id: 'construction',
    name: 'Construction',
    description:
      'Building materials and structural components. Pokémon with this preference enjoy the process of building and assembling.',
    examples: [
      'Brick',
      'Iron beam',
      'Concrete mixer',
      'Foundation',
      'Scaffolding',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(
        item,
        'construct',
        'scaffold',
        'foundation',
        'beam',
        'pillar',
        'column',
      ) +
      scoreNameOnly(
        item,
        'brick',
        'concrete',
        'lumber',
        'iron beam',
        'partition',
      ),
  },
  {
    id: 'electronics',
    name: 'Electronics',
    description:
      'Electronic devices and powered gadgets. Pokémon with this preference are drawn to technology and digital equipment.',
    examples: [
      'Computer',
      'Laptop',
      'Gaming PC',
      'Tablet',
      'Television',
      'CD player',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(
        item,
        'computer',
        'electronic',
        'laptop',
        'tablet',
        'television',
        'monitor',
        'gaming',
        'powered on',
        'cd player',
        'phone',
        'printer',
        'camera',
      ),
  },
  {
    id: 'fabric',
    name: 'Fabric',
    description:
      'Textile, cloth, and woven items. Pokémon with this preference appreciate soft fabrics and draped materials.',
    examples: [
      'Simple curtain',
      'Cloth wall',
      'Fluffy flooring',
      'Woven carpeting',
      'Towel rack',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(
        item,
        'fabric',
        'cloth',
        'textile',
        'woven',
        'carpet',
        'curtain',
        'felt',
        'rug',
        'mat',
        'towel',
      ),
  },
  {
    id: 'garbage',
    name: 'Garbage',
    description:
      'Trash, junk, and discarded items. Pokémon with this preference are oddly attracted to waste and refuse.',
    examples: [
      'Garbage bags',
      'Garbage bin',
      'Nonburnable garbage',
      'Grubby letter',
      'Wastepaper',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(
        item,
        'garbage',
        'trash',
        'junk',
        'grubby',
        'waste',
        'debris',
        'scrap',
        'rusted',
        'damaged',
        'broken',
        'worn',
      ) + scoreNameOnly(item, 'recycling bin', 'tire'),
  },
  {
    id: 'containers',
    name: 'Containers',
    description:
      'Storage items like boxes, chests, and barrels. Pokémon with this preference like things that hold other things.',
    examples: [
      'Storage Box',
      'Big storage box',
      'Plain chest',
      'Poké Ball Chest',
      'Barrel',
      'Cardboard boxes',
    ],
    itemScorer: (item) =>
      scoreNameOrDesc(
        item,
        'storage',
        'chest',
        'barrel',
        'container',
        'store items',
      ) +
      scoreNameOnly(
        item,
        'locker',
        'closet',
        'cabinet',
        'crate',
        'cardboard box',
        'picnic basket',
      ),
  },
  {
    id: 'luxury',
    name: 'Luxury',
    description:
      'High-end, elegant, and expensive-looking items. Pokémon with this preference have refined and lavish taste.',
    examples: [
      'Luxury table',
      'Luxury sofa',
      'Luxury lamp',
      'Luxury bed',
      'Gold ingot',
      'Antique clock',
    ],
    itemScorer: (item) =>
      scoreNameOnly(item, 'luxury', 'antique', 'chic', 'fancy', 'elegant') +
      scoreNameOrDesc(item, 'high-class', 'extravagant', 'lavish', 'classy'),
  },
  {
    id: 'looks-like-food',
    name: 'Looks like food',
    description:
      'Items that resemble food or beverages. Pokémon with this preference are drawn to anything that looks delicious.',
    examples: [
      'Pizza',
      'Fried potatoes',
      'Soda float',
      'Chocolate cookies',
      'Sandwiches',
      'Shaved ice',
    ],
    itemScorer: (item) =>
      scoreNameOnly(
        item,
        'pizza',
        'fried potatoes',
        'soda float',
        'chocolate cookies',
        'sandwiches',
        'shaved ice',
        'ribbon cake',
        'afternoon tea set',
        'berry basket',
        'berry clock',
        'berry table',
        'berry chair',
        'berry bed',
        'berry case',
        'berry lamp',
      ),
  },
  {
    id: 'sweet-flavors',
    name: 'Sweet flavors',
    description:
      'Pokémon with this preference enjoy Sweet-flavored cooked foods. Sweet foods are often made with Pecha Berries.',
    examples: [
      'Fluffy bread',
      'Potato hamburger steak',
      'Pecha Berry',
      'Leppa salad',
    ],
    itemScorer: (item) =>
      item.category === 'Food'
        ? scoreNameOrDesc(item, 'sweet', 'pecha')
        : 0,
  },
  {
    id: 'sour-flavors',
    name: 'Sour flavors',
    description:
      'Pokémon with this preference enjoy Sour-flavored cooked foods. Sour foods are often made with Aspear Berries.',
    examples: [
      'Shredded salad',
      'Tomato hamburger steak',
      'Aspear Berry',
      'Flavorful soup',
    ],
    itemScorer: (item) =>
      item.category === 'Food'
        ? scoreNameOrDesc(item, 'sour', 'aspear')
        : 0,
  },
  {
    id: 'spicy-flavors',
    name: 'Spicy flavors',
    description:
      'Pokémon with this preference enjoy Spicy-flavored cooked foods. Spicy foods are often made with carrots and strong ingredients.',
    examples: [
      'Crouton salad',
      'Carrot bread',
      'Electrifying soup',
      'Chili sauce',
    ],
    itemScorer: (item) =>
      item.category === 'Food'
        ? scoreNameOrDesc(item, 'spicy', 'carrot', 'chili', 'electrifying')
        : 0,
  },
  {
    id: 'bitter-flavors',
    name: 'Bitter flavors',
    description:
      'Pokémon with this preference enjoy Bitter-flavored cooked foods. Bitter foods are often made with Rawst Berries and seaweed.',
    examples: [
      'Seaweed salad',
      'Bitter hamburger steak',
      'Rawst Berry',
      'Recycled bread',
    ],
    itemScorer: (item) =>
      item.category === 'Food'
        ? scoreNameOrDesc(item, 'bitter', 'rawst', 'seaweed')
        : 0,
  },
  {
    id: 'dry-flavors',
    name: 'Dry flavors',
    description:
      'Pokémon with this preference enjoy Dry-flavored cooked foods. Dry foods are often made with Chesto Berries and mushrooms.',
    examples: [
      'Crushed-berry salad',
      'Mushroom hamburger steak',
      'Chesto Berry',
      'Mushroom soup',
    ],
    itemScorer: (item) =>
      item.category === 'Food'
        ? scoreNameOrDesc(item, 'dry', 'chesto', 'mushroom')
        : 0,
  },
];

export function getFavoriteCategoryByName(
  name: string,
): FavoriteCategory | undefined {
  return favoriteCategories.find(
    (c) => c.name.toLowerCase() === name.toLowerCase(),
  );
}

export function getFavoriteCategoryById(
  id: string,
): FavoriteCategory | undefined {
  return favoriteCategories.find((c) => c.id === id);
}
