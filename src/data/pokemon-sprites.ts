const NATIONAL_DEX_MAP: Record<string, number> = {
  // #001-#009: Kanto Starters
  'Bulbasaur': 1,
  'Ivysaur': 2,
  'Venusaur': 3,
  'Charmander': 4,
  'Charmeleon': 5,
  'Charizard': 6,
  'Squirtle': 7,
  'Wartortle': 8,
  'Blastoise': 9,

  // #010-#012: Pidgey line
  'Pidgey': 16,
  'Pidgeotto': 17,
  'Pidgeot': 18,

  // #013-#016: Oddish line
  'Oddish': 43,
  'Gloom': 44,
  'Vileplume': 45,
  'Bellossom': 182,

  // #017-#020: Paras & Venonat lines
  'Paras': 46,
  'Parasect': 47,
  'Venonat': 48,
  'Venomoth': 49,

  // #021-#023: Bellsprout line
  'Bellsprout': 69,
  'Weepinbell': 70,
  'Victreebel': 71,

  // #024-#026: Slowpoke line
  'Slowpoke': 79,
  'Slowbro': 80,
  'Slowking': 199,

  // #027-#029: Magnemite line
  'Magnemite': 81,
  'Magneton': 82,
  'Magnezone': 462,

  // #030-#031: Onix line
  'Onix': 95,
  'Steelix': 208,

  // #032-#033: Cubone line
  'Cubone': 104,
  'Marowak': 105,

  // #034-#037: Tyrogue line
  'Tyrogue': 236,
  'Hitmonlee': 106,
  'Hitmonchan': 107,
  'Hitmontop': 237,

  // #038-#039: Koffing line
  'Koffing': 109,
  'Weezing': 110,

  // #040-#041: Tangela line
  'Tangela': 114,
  'Tangrowth': 465,

  // #042-#044: Scyther, Pinsir
  'Scyther': 123,
  'Scizor': 212,
  'Pinsir': 127,

  // #045-#046: Magikarp line
  'Magikarp': 129,
  'Gyarados': 130,

  // #047: Ditto
  'Ditto': 132,

  // #048-#049: Hoothoot line
  'Hoothoot': 163,
  'Noctowl': 164,

  // #050: Heracross
  'Heracross': 214,

  // #051-#052: Volbeat & Illumise
  'Volbeat': 313,
  'Illumise': 314,

  // #053-#054: Gulpin line
  'Gulpin': 316,
  'Swalot': 317,

  // #055-#056: Cacnea line
  'Cacnea': 331,
  'Cacturne': 332,

  // #057-#058: Combee line
  'Combee': 415,
  'Vespiquen': 416,

  // #059: Shellos (both forms)
  'Shellos': 422,
  'Shellos East Sea': 422,

  // #060: Gastrodon (both forms)
  'Gastrodon': 423,
  'Gastrodon East Sea': 423,

  // #061-#062: Drifloon line
  'Drifloon': 425,
  'Drifblim': 426,

  // #063-#064: Drilbur line
  'Drilbur': 529,
  'Excadrill': 530,

  // #065-#067: Timburr line
  'Timburr': 532,
  'Gurdurr': 533,
  'Conkeldurr': 534,

  // #068-#070: Litwick line
  'Litwick': 607,
  'Lampent': 608,
  'Chandelure': 609,

  // #071-#073: Axew line
  'Axew': 610,
  'Fraxure': 611,
  'Haxorus': 612,

  // #074-#076: Goomy line
  'Goomy': 704,
  'Sliggoo': 705,
  'Goodra': 706,

  // #077: Cramorant
  'Cramorant': 845,

  // #078-#080: Pichu line + Peakychu
  'Pichu': 172,
  'Pikachu': 25,
  'Peakychu': 25,
  'Raichu': 26,

  // #081-#083: Zubat line
  'Zubat': 41,
  'Golbat': 42,
  'Crobat': 169,

  // #084-#085: Meowth line
  'Meowth': 52,
  'Persian': 53,

  // #086-#087: Psyduck line
  'Psyduck': 54,
  'Golduck': 55,

  // #088-#089: Growlithe line
  'Growlithe': 58,
  'Arcanine': 59,

  // #091-#092: Grimer line
  'Grimer': 88,
  'Muk': 89,

  // #093-#095: Gastly line
  'Gastly': 92,
  'Haunter': 93,
  'Gengar': 94,

  // #096-#097: Voltorb line
  'Voltorb': 100,
  'Electrode': 101,

  // #098-#099: Exeggcute line
  'Exeggcute': 102,
  'Exeggutor': 103,

  // #100-#102: Happiny line
  'Happiny': 440,
  'Chansey': 113,
  'Blissey': 242,

  // #103-#105: Elekid line
  'Elekid': 239,
  'Electabuzz': 125,
  'Electivire': 466,

  // #106: Lapras
  'Lapras': 131,

  // #107-#109: Munchlax line + Mosslax
  'Munchlax': 446,
  'Mosslax': 143,
  'Snorlax': 143,

  // #110: Ariados
  'Ariados': 168,

  // #111-#113: Mareep line
  'Mareep': 179,
  'Flaaffy': 180,
  'Ampharos': 181,

  // #114-#116: Azurill line
  'Azurill': 298,
  'Marill': 183,
  'Azumarill': 184,

  // #117-#118: Paldean Wooper line
  'Paldean Wooper': 194,
  'Clodsire': 980,

  // #119: Smeargle
  'Smeargle': 235,

  // #120-#122: Torchic line
  'Torchic': 255,
  'Combusken': 256,
  'Blaziken': 257,

  // #123-#124: Wingull line
  'Wingull': 278,
  'Pelipper': 279,

  // #125-#126: Makuhita line
  'Makuhita': 296,
  'Hariyama': 297,

  // #127: Absol
  'Absol': 359,

  // #128-#130: Piplup line
  'Piplup': 393,
  'Prinplup': 394,
  'Empoleon': 395,

  // #131: Audino
  'Audino': 531,

  // #132-#133: Trubbish line
  'Trubbish': 568,
  'Garbodor': 569,

  // #134-#135: Zorua line
  'Zorua': 570,
  'Zoroark': 571,

  // #136-#137: Minccino line
  'Minccino': 572,
  'Cinccino': 573,

  // #138-#140: Grubbin line
  'Grubbin': 736,
  'Charjabug': 737,
  'Vikavolt': 738,

  // #141: Mimikyu
  'Mimikyu': 778,

  // #142-#144: Pawmi line
  'Pawmi': 921,
  'Pawmo': 922,
  'Pawmot': 923,

  // #145: Tatsugiri (all forms)
  'Tatsugiri Curly Form': 978,
  'Tatsugiri Droopy Form': 978,
  'Tatsugiri Stretchy Form': 978,

  // #146-#147: Ekans line
  'Ekans': 23,
  'Arbok': 24,

  // #148-#150: Cleffa line
  'Cleffa': 173,
  'Clefairy': 35,
  'Clefable': 36,

  // #151-#153: Igglybuff line
  'Igglybuff': 174,
  'Jigglypuff': 39,
  'Wigglytuff': 40,

  // #154-#155: Diglett line
  'Diglett': 50,
  'Dugtrio': 51,

  // #156-#158: Machop line
  'Machop': 66,
  'Machoke': 67,
  'Machamp': 68,

  // #159-#161: Geodude line
  'Geodude': 74,
  'Graveler': 75,
  'Golem': 76,

  // #162-#164: Magby line
  'Magby': 240,
  'Magmar': 126,
  'Magmortar': 467,

  // #165-#166: Bonsly line
  'Bonsly': 438,
  'Sudowoodo': 185,

  // #167-#168: Murkrow line
  'Murkrow': 198,
  'Honchkrow': 430,

  // #169-#171: Larvitar line
  'Larvitar': 246,
  'Pupitar': 247,
  'Tyranitar': 248,

  // #172-#174: Lotad line
  'Lotad': 270,
  'Lombre': 271,
  'Ludicolo': 272,

  // #175: Mawile
  'Mawile': 303,

  // #176: Torkoal
  'Torkoal': 324,

  // #177-#178: Kricketot line
  'Kricketot': 401,
  'Kricketune': 402,

  // #179: Chatot
  'Chatot': 441,

  // #180-#181: Riolu line
  'Riolu': 447,
  'Lucario': 448,

  // #182: Stereo Rotom (uses Rotom sprite)
  'Stereo Rotom': 479,

  // #183-#184: Larvesta line
  'Larvesta': 636,
  'Volcarona': 637,

  // #185-#187: Rowlet line
  'Rowlet': 722,
  'Dartrix': 723,
  'Decidueye': 724,

  // #188-#190: Scorbunny line
  'Scorbunny': 813,
  'Raboot': 814,
  'Cinderace': 815,

  // #191-#192: Skwovet line
  'Skwovet': 819,
  'Greedent': 820,

  // #193-#195: Rolycoly line
  'Rolycoly': 837,
  'Carkol': 838,
  'Coalossal': 839,

  // #196-#197: Toxel line (both forms)
  'Toxel': 848,
  'Toxtricity Amped Form': 849,
  'Toxtricity Low Key Form': 849,

  // #198-#199: Fidough line
  'Fidough': 926,
  'Dachsbun': 927,

  // #200-#202: Charcadet line
  'Charcadet': 935,
  'Armarouge': 936,
  'Ceruledge': 937,

  // #203-#204: Glimmet line
  'Glimmet': 969,
  'Glimmora': 970,

  // #205-#206: Gimmighoul line
  'Gimmighoul': 999,
  'Gholdengo': 1000,

  // #207-#208: Vulpix line
  'Vulpix': 37,
  'Ninetales': 38,

  // #209-#212: Poliwag line
  'Poliwag': 60,
  'Poliwhirl': 61,
  'Poliwrath': 62,
  'Politoed': 186,

  // #213-#215: Abra line
  'Abra': 63,
  'Kadabra': 64,
  'Alakazam': 65,

  // #218-#220: Porygon line
  'Porygon': 137,
  'Porygon2': 233,
  'Porygon-Z': 474,

  // #221-#223: Dratini line
  'Dratini': 147,
  'Dragonair': 148,
  'Dragonite': 149,

  // #224-#226: Cyndaquil line
  'Cyndaquil': 155,
  'Quilava': 156,
  'Typhlosion': 157,

  // #227-#228: Misdreavus line
  'Misdreavus': 200,
  'Mismagius': 429,

  // #229-#230: Girafarig line
  'Girafarig': 203,
  'Farigiraf': 981,

  // #231-#234: Ralts line
  'Ralts': 280,
  'Kirlia': 281,
  'Gardevoir': 282,
  'Gallade': 475,

  // #235-#236: Plusle & Minun
  'Plusle': 311,
  'Minun': 312,

  // #237-#239: Trapinch line
  'Trapinch': 328,
  'Vibrava': 329,
  'Flygon': 330,

  // #240-#241: Swablu line
  'Swablu': 333,
  'Altaria': 334,

  // #242-#244: Duskull line
  'Duskull': 355,
  'Dusclops': 356,
  'Dusknoir': 477,

  // #245-#247: Beldum line
  'Beldum': 374,
  'Metang': 375,
  'Metagross': 376,

  // #248-#250: Snivy line
  'Snivy': 495,
  'Servine': 496,
  'Serperior': 497,

  // #251-#253: Froakie line
  'Froakie': 656,
  'Frogadier': 657,
  'Greninja': 658,

  // #254: Dedenne
  'Dedenne': 702,

  // #255-#256: Noibat line
  'Noibat': 714,
  'Noivern': 715,

  // #257-#259: Rookidee line
  'Rookidee': 821,
  'Corvisquire': 822,
  'Corviknight': 823,

  // #260-#262: Dreepy line
  'Dreepy': 885,
  'Drakloak': 886,
  'Dragapult': 887,

  // #263-#265: Sprigatito line
  'Sprigatito': 906,
  'Floragato': 907,
  'Meowscarada': 908,

  // #266-#267: Wattrel line
  'Wattrel': 940,
  'Kilowattrel': 941,

  // #268-#270: Tinkatink line
  'Tinkatink': 957,
  'Tinkatuff': 958,
  'Tinkaton': 959,

  // #271: Aerodactyl
  'Aerodactyl': 142,

  // #272-#273: Cranidos line
  'Cranidos': 408,
  'Rampardos': 409,

  // #274-#275: Shieldon line
  'Shieldon': 410,
  'Bastiodon': 411,

  // #276-#277: Tyrunt line
  'Tyrunt': 696,
  'Tyrantrum': 697,

  // #278-#279: Amaura line
  'Amaura': 698,
  'Aurorus': 699,

  // #280-#288: Eevee & Eeveelutions
  'Eevee': 133,
  'Vaporeon': 134,
  'Jolteon': 135,
  'Flareon': 136,
  'Espeon': 196,
  'Umbreon': 197,
  'Leafeon': 470,
  'Glaceon': 471,
  'Sylveon': 700,

  // #289: Kyogre
  'Kyogre': 382,

  // #290-#292: Legendary Beasts
  'Raikou': 243,
  'Entei': 244,
  'Suicune': 245,

  // #293: Volcanion
  'Volcanion': 721,

  // #294-#296: Legendary Birds
  'Articuno': 144,
  'Zapdos': 145,
  'Moltres': 146,

  // #297-#298: Tower Duo
  'Lugia': 249,
  'Ho-Oh': 250,

  // #299-#300: Mewtwo & Mew
  'Mewtwo': 150,
  'Mew': 151,
};

const SPRITE_OVERRIDES: Record<string, string> = {
  'Peakychu': '/images/pokemon/25-peakychu.png',
  'Professor Tangrowth': '/images/pokemon/465-professor.png',
  'Mosslax': '/images/pokemon/143-mosslax.png',
  'Shellos East Sea': '/images/pokemon/422-eastsea.png',
  'Gastrodon East Sea': '/images/pokemon/423-eastsea.png',
  'Tatsugiri Curly Form': '/images/pokemon/978-curly.png',
  'Tatsugiri Droopy Form': '/images/pokemon/978-droopy.png',
  'Tatsugiri Stretchy Form': '/images/pokemon/978-stretchy.png',
  'Toxtricity Amped Form': '/images/pokemon/849-amped.png',
  'Toxtricity Low Key Form': '/images/pokemon/849-lowkey.png',
  'Stereo Rotom': '/images/pokemon/479-stereo.png',
};

export function getSpriteUrl(pokemonName: string): string {
  if (SPRITE_OVERRIDES[pokemonName]) return SPRITE_OVERRIDES[pokemonName];
  const dexNum = NATIONAL_DEX_MAP[pokemonName];
  if (dexNum) return `/images/pokemon/${dexNum}.png`;
  return '/images/pokemon/0.png';
}

export function getSpriteUrlOrFallback(pokemonName: string): string | null {
  if (SPRITE_OVERRIDES[pokemonName]) return SPRITE_OVERRIDES[pokemonName];
  const dexNum = NATIONAL_DEX_MAP[pokemonName];
  if (!dexNum) return null;
  return `/images/pokemon/${dexNum}.png`;
}

export function getNationalDexId(pokemonName: string): number | null {
  return NATIONAL_DEX_MAP[pokemonName] ?? null;
}

export { NATIONAL_DEX_MAP };
