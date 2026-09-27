// Comprehensive Minecraft & Hypixel SkyBlock Texture Resolver

const CDN_BASE_ITEMS = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.8.9/assets/minecraft/textures/items';
const CDN_BASE_BLOCKS = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.8.9/assets/minecraft/textures/blocks';

// Minecraft 1.8.9 Item ID to Texture Name Mapping
const MC_ITEMS_MAP = {
  256: 'iron_shovel',
  257: 'iron_pickaxe',
  258: 'iron_axe',
  259: 'flint_and_steel',
  260: 'apple',
  261: 'bow_standby',
  262: 'arrow',
  263: 'coal',
  264: 'diamond',
  265: 'iron_ingot',
  266: 'gold_ingot',
  267: 'iron_sword',
  268: 'wood_sword',
  269: 'wood_shovel',
  270: 'wood_pickaxe',
  271: 'wood_axe',
  272: 'stone_sword',
  273: 'stone_shovel',
  274: 'stone_pickaxe',
  275: 'stone_axe',
  276: 'diamond_sword',
  277: 'diamond_shovel',
  278: 'diamond_pickaxe',
  279: 'diamond_axe',
  280: 'stick',
  281: 'bowl',
  282: 'mushroom_stew',
  283: 'gold_sword',
  284: 'gold_shovel',
  285: 'gold_pickaxe',
  286: 'gold_axe',
  287: 'string',
  288: 'feather',
  289: 'gunpowder',
  290: 'wood_hoe',
  291: 'stone_hoe',
  292: 'iron_hoe',
  293: 'diamond_hoe',
  294: 'gold_hoe',
  295: 'seeds_wheat',
  296: 'wheat',
  297: 'bread',
  298: 'leather_helmet',
  299: 'leather_chestplate',
  300: 'leather_leggings',
  301: 'leather_boots',
  302: 'chainmail_helmet',
  303: 'chainmail_chestplate',
  304: 'chainmail_leggings',
  305: 'chainmail_boots',
  306: 'iron_helmet',
  307: 'iron_chestplate',
  308: 'iron_leggings',
  309: 'iron_boots',
  310: 'diamond_helmet',
  311: 'diamond_chestplate',
  312: 'diamond_leggings',
  313: 'diamond_boots',
  314: 'gold_helmet',
  315: 'gold_chestplate',
  316: 'gold_leggings',
  317: 'gold_boots',
  318: 'flint',
  319: 'porkchop_raw',
  320: 'porkchop_cooked',
  321: 'painting',
  322: 'apple_golden',
  323: 'sign',
  324: 'door_wood',
  325: 'bucket_empty',
  326: 'bucket_water',
  327: 'bucket_lava',
  328: 'minecart_normal',
  329: 'saddle',
  330: 'door_iron',
  331: 'redstone_dust',
  332: 'snowball',
  333: 'boat',
  334: 'leather',
  335: 'bucket_milk',
  336: 'brick',
  337: 'clay_ball',
  338: 'reeds',
  339: 'paper',
  340: 'book_normal',
  341: 'slimeball',
  344: 'egg',
  345: 'compass',
  346: 'fishing_rod_uncast',
  347: 'clock',
  348: 'glowstone_dust',
  349: 'fish_cod_raw',
  350: 'fish_cod_cooked',
  352: 'bone',
  353: 'sugar',
  354: 'cake',
  355: 'bed',
  356: 'repeater',
  357: 'cookie',
  358: 'map_filled',
  359: 'shears',
  360: 'melon',
  361: 'seeds_pumpkin',
  362: 'seeds_melon',
  363: 'beef_raw',
  364: 'beef_cooked',
  365: 'chicken_raw',
  366: 'chicken_cooked',
  367: 'rotten_flesh',
  368: 'ender_pearl',
  369: 'blaze_rod',
  370: 'ghast_tear',
  371: 'gold_nugget',
  372: 'nether_wart',
  373: 'potion_bottle_drinkable',
  374: 'glass_bottle',
  375: 'spider_eye',
  376: 'spider_eye_fermented',
  377: 'blaze_powder',
  378: 'magma_cream',
  379: 'brewing_stand',
  380: 'cauldron',
  381: 'ender_eye',
  382: 'speckled_melon',
  384: 'experience_bottle',
  388: 'emerald',
  389: 'item_frame',
  390: 'flower_pot',
  391: 'carrot',
  392: 'potato',
  393: 'potato_baked',
  394: 'potato_poisonous',
  395: 'map_empty',
  396: 'carrot_golden',
  398: 'carrot_on_a_stick',
  399: 'nether_star',
  400: 'pumpkin_pie',
  401: 'fireworks',
  402: 'fireworks_charge',
  403: 'book_enchanted',
  404: 'comparator',
  405: 'netherbrick',
  406: 'quartz',
  409: 'prismarine_shard',
  410: 'prismarine_crystals',
  411: 'rabbit_raw',
  412: 'rabbit_cooked',
  413: 'rabbit_stew',
  414: 'rabbit_foot',
  415: 'rabbit_hide',
  416: 'armor_stand',
  417: 'iron_horse_armor',
  418: 'golden_horse_armor',
  419: 'diamond_horse_armor',
  420: 'lead',
  421: 'name_tag',
  423: 'mutton_raw',
  424: 'mutton_cooked',
  438: 'potion_bottle_splash'
};

// Minecraft 1.8.9 Dyes (Item ID 351)
const MC_DYES_MAP = {
  0: 'dye_powder_black',
  1: 'dye_powder_red',
  2: 'dye_powder_green',
  3: 'dye_powder_brown',
  4: 'dye_powder_blue',
  5: 'dye_powder_purple',
  6: 'dye_powder_cyan',
  7: 'dye_powder_silver',
  8: 'dye_powder_gray',
  9: 'dye_powder_pink',
  10: 'dye_powder_lime',
  11: 'dye_powder_yellow',
  12: 'dye_powder_light_blue',
  13: 'dye_powder_magenta',
  14: 'dye_powder_orange',
  15: 'dye_powder_white'
};

// Minecraft 1.8.9 Block ID to Texture Name Mapping
const MC_BLOCKS_MAP = {
  1: 'stone',
  2: 'grass_top',
  3: 'dirt',
  4: 'cobblestone',
  5: 'planks_oak',
  7: 'bedrock',
  12: 'sand',
  13: 'gravel',
  14: 'gold_ore',
  15: 'iron_ore',
  16: 'coal_ore',
  17: 'log_oak',
  18: 'leaves_oak',
  19: 'sponge',
  20: 'glass',
  21: 'lapis_ore',
  22: 'lapis_block',
  23: 'dispenser_front_vertical',
  24: 'sandstone_normal',
  35: 'wool_colored_white',
  41: 'gold_block',
  42: 'iron_block',
  45: 'brick',
  46: 'tnt_side',
  47: 'bookshelf',
  48: 'cobblestone_mossy',
  49: 'obsidian',
  54: 'chest',
  56: 'diamond_ore',
  57: 'diamond_block',
  58: 'crafting_table_front',
  61: 'furnace_front_off',
  73: 'redstone_ore',
  79: 'ice',
  81: 'cactus_side',
  82: 'clay',
  86: 'pumpkin_face_off',
  87: 'netherrack',
  88: 'soul_sand',
  89: 'glowstone',
  103: 'melon_side',
  116: 'enchanting_table_top',
  121: 'end_stone',
  129: 'emerald_ore',
  133: 'emerald_block',
  138: 'beacon',
  152: 'redstone_block',
  153: 'quartz_ore',
  155: 'quartz_block_side',
  158: 'dropper_front_vertical',
  165: 'slime',
  168: 'prismarine_rough',
  169: 'sea_lantern',
  170: 'hay_block_side',
  173: 'coal_block',
  174: 'packed_ice'
};

/**
 * Extracts head hash from skullTexture Base64 string
 */
export function getSkullHash(skullTexture) {
  if (!skullTexture) return null;
  try {
    const jsonStr = typeof window !== 'undefined'
      ? atob(skullTexture)
      : Buffer.from(skullTexture, 'base64').toString('utf8');
    const parsed = JSON.parse(jsonStr);
    const url = parsed?.textures?.SKIN?.url;
    if (url) {
      return url.split('/').pop();
    }
  } catch {}
  return null;
}

/**
 * Resolves full texture image URL for any Minecraft or Hypixel SkyBlock item
 */
export function getItemTexture(item) {
  if (!item || item.empty) return null;
  if (item.icon) return item.icon;
  if (item.texture) return item.texture;

  // 1. Custom Player Skull Texture (Talismans, Helmets, Heads, Backpacks, Pets)
  if (item.skullTexture) {
    const hash = getSkullHash(item.skullTexture);
    if (hash) {
      return `https://mc-heads.net/head/${hash}/64`;
    }
  }

  // 2. Specific SkyBlock Item Overrides (by SkyBlock ID)
  const sbId = (item.skyblockId || '').toUpperCase();
  if (sbId) {
    // Hyperion & Wither Blades
    if (['HYPERION', 'VALKYRIE', 'SCYLLA', 'ASTRAEA', 'NECRON_BLADE'].includes(sbId)) {
      return `${CDN_BASE_ITEMS}/iron_sword.png`;
    }
    if (['GIANTS_SWORD', 'GIANT_SWORD'].includes(sbId)) {
      return `${CDN_BASE_ITEMS}/iron_sword.png`;
    }
    if (['LIVID_DAGGER', 'SHADOW_FURY', 'DARK_CLAYMORE', 'FEL_SWORD', 'SILENT_DEATH'].includes(sbId)) {
      return `${CDN_BASE_ITEMS}/stone_sword.png`;
    }
    if (['TERMINATOR', 'JUJU_SHORTBOW', 'RUNAANS_BOW', 'MOSQUITO_BOW', 'DRAGON_SHORTBOW', 'SPIRIT_BOW', 'VENOM_TOUCHE_BOW', 'SAVANNA_BOW', 'MAGMA_BOW'].includes(sbId)) {
      return `${CDN_BASE_ITEMS}/bow_standby.png`;
    }
    if (['ASPECT_OF_THE_DRAGONS', 'AOTD', 'REAPER_FALCHION', 'DAEDALUS_AXE', 'ASPECT_OF_THE_END', 'AOTE', 'ASPECT_OF_THE_VOID', 'AOTV', 'LEAPING_SWORD', 'SILK_EDGE_SWORD', 'TACTICIANS_SWORD', 'EDIBLE_MACE', 'REVENANT_FALCHION', 'REAPER_SCYTHE'].includes(sbId)) {
      return `${CDN_BASE_ITEMS}/diamond_sword.png`;
    }
    if (['MIDAS_SWORD', 'ROGUE_SWORD', 'MIDAS_STAFF', 'FANCY_SWORD'].includes(sbId)) {
      return `${CDN_BASE_ITEMS}/gold_sword.png`;
    }
    if (sbId === 'FLOWER_OF_TRUTH') {
      return '/textures/minecraft/poppy.png';
    }
    if (sbId === 'BONERANG') {
      return `${CDN_BASE_ITEMS}/bone.png`;
    }
    if (['SPIRIT_SCEPTRE', 'AURORA_STAFF', 'FIRE_VEIL_WAND', 'GYROKINETIC_WAND'].includes(sbId)) {
      return `${CDN_BASE_ITEMS}/blaze_rod.png`;
    }
    if (['WAND_OF_HEALING', 'WAND_OF_MENDING', 'WAND_OF_RESTORATION', 'WAND_OF_ATONEMENT', 'ICE_SPRAY_WAND'].includes(sbId)) {
      return `${CDN_BASE_ITEMS}/stick.png`;
    }
    if (['TREE_CAPITATOR', 'TREECAPITATOR'].includes(sbId)) {
      return `${CDN_BASE_ITEMS}/gold_axe.png`;
    }
    if (sbId === 'JUNGLE_AXE') {
      return `${CDN_BASE_ITEMS}/wood_axe.png`;
    }
    if (['ROD_OF_THE_SEA', 'SHREDDER', 'CHAMPION_ROD', 'SPEEDSTER_ROD'].includes(sbId)) {
      return `${CDN_BASE_ITEMS}/fishing_rod_uncast.png`;
    }
    if (sbId === 'SUPER_COMPACTOR_3000') {
      return `${CDN_BASE_BLOCKS}/dropper_front_vertical.png`;
    }
    if (sbId === 'COMPACTOR') {
      return `${CDN_BASE_BLOCKS}/dispenser_front_vertical.png`;
    }
    if (sbId === 'AUTO_SMELTER') {
      return `${CDN_BASE_BLOCKS}/furnace_front_off.png`;
    }
    if (['RECOMBOBULATOR_3000', 'NETHER_STAR'].includes(sbId)) {
      return `${CDN_BASE_ITEMS}/nether_star.png`;
    }
    if (sbId === 'BOOSTER_COOKIE') {
      return `${CDN_BASE_ITEMS}/cookie.png`;
    }
    if (['SUMMONING_EYE', 'REMNANT_OF_THE_EYE'].includes(sbId)) {
      return `${CDN_BASE_ITEMS}/ender_eye.png`;
    }
    if (['HOT_POTATO_BOOK', 'FUMING_POTATO_BOOK', 'ENCHANTED_BOOK'].includes(sbId)) {
      return `${CDN_BASE_ITEMS}/book_enchanted.png`;
    }

    // Armor Sets
    if (sbId.includes('_CHESTPLATE')) {
      if (sbId.includes('NECRON') || sbId.includes('STORM') || sbId.includes('MAXOR') || sbId.includes('GOLDOR') || sbId.includes('SHADOW_ASSASSIN') || sbId.includes('CRIMSON') || sbId.includes('AURORA') || sbId.includes('TERROR')) {
        return `${CDN_BASE_ITEMS}/leather_chestplate.png`;
      }
      return `${CDN_BASE_ITEMS}/diamond_chestplate.png`;
    }
    if (sbId.includes('_LEGGINGS')) {
      if (sbId.includes('NECRON') || sbId.includes('STORM') || sbId.includes('MAXOR') || sbId.includes('GOLDOR') || sbId.includes('SHADOW_ASSASSIN')) {
        return `${CDN_BASE_ITEMS}/leather_leggings.png`;
      }
      return `${CDN_BASE_ITEMS}/diamond_leggings.png`;
    }
    if (sbId.includes('_BOOTS')) {
      if (sbId.includes('NECRON') || sbId.includes('STORM') || sbId.includes('MAXOR') || sbId.includes('GOLDOR') || sbId.includes('SHADOW_ASSASSIN')) {
        return `${CDN_BASE_ITEMS}/leather_boots.png`;
      }
      return `${CDN_BASE_ITEMS}/diamond_boots.png`;
    }
    if (sbId.includes('_HELMET')) {
      return `${CDN_BASE_ITEMS}/diamond_helmet.png`;
    }

    // Common SkyBlock Enchanted Materials
    if (sbId.includes('HAY')) return `${CDN_BASE_BLOCKS}/hay_block_side.png`;
    if (sbId.includes('SUGAR_CANE')) return `${CDN_BASE_ITEMS}/reeds.png`;
    if (sbId.includes('NETHER_STALK') || sbId.includes('NETHER_WART')) return `${CDN_BASE_ITEMS}/nether_wart.png`;
    if (sbId.includes('CACTUS')) return `${CDN_BASE_BLOCKS}/cactus_side.png`;
    if (sbId.includes('CARROT')) return `${CDN_BASE_ITEMS}/carrot.png`;
    if (sbId.includes('BAKED_POTATO')) return `${CDN_BASE_ITEMS}/potato_baked.png`;
    if (sbId.includes('POTATO')) return `${CDN_BASE_ITEMS}/potato.png`;
    if (sbId.includes('PUMPKIN')) return `${CDN_BASE_BLOCKS}/pumpkin_face_off.png`;
    if (sbId.includes('MELON')) return `${CDN_BASE_ITEMS}/melon.png`;
    if (sbId.includes('DIAMOND_BLOCK')) return `${CDN_BASE_BLOCKS}/diamond_block.png`;
    if (sbId.includes('DIAMOND')) return `${CDN_BASE_ITEMS}/diamond.png`;
    if (sbId.includes('EMERALD_BLOCK')) return `${CDN_BASE_BLOCKS}/emerald_block.png`;
    if (sbId.includes('EMERALD')) return `${CDN_BASE_ITEMS}/emerald.png`;
    if (sbId.includes('IRON_BLOCK')) return `${CDN_BASE_BLOCKS}/iron_block.png`;
    if (sbId.includes('IRON')) return `${CDN_BASE_ITEMS}/iron_ingot.png`;
    if (sbId.includes('GOLD_BLOCK')) return `${CDN_BASE_BLOCKS}/gold_block.png`;
    if (sbId.includes('GOLD')) return `${CDN_BASE_ITEMS}/gold_ingot.png`;
    if (sbId.includes('REDSTONE_BLOCK')) return `${CDN_BASE_BLOCKS}/redstone_block.png`;
    if (sbId.includes('REDSTONE')) return `${CDN_BASE_ITEMS}/redstone_dust.png`;
    if (sbId.includes('LAPIS_BLOCK')) return `${CDN_BASE_BLOCKS}/lapis_block.png`;
    if (sbId.includes('LAPIS')) return `${CDN_BASE_ITEMS}/dye_powder_blue.png`;
    if (sbId.includes('COAL_BLOCK')) return `${CDN_BASE_BLOCKS}/coal_block.png`;
    if (sbId.includes('COAL')) return `${CDN_BASE_ITEMS}/coal.png`;
    if (sbId.includes('OBSIDIAN')) return `${CDN_BASE_BLOCKS}/obsidian.png`;
    if (sbId.includes('GLOWSTONE_DUST')) return `${CDN_BASE_ITEMS}/glowstone_dust.png`;
    if (sbId.includes('GLOWSTONE')) return `${CDN_BASE_BLOCKS}/glowstone.png`;
    if (sbId.includes('QUARTZ')) return `${CDN_BASE_ITEMS}/quartz.png`;
    if (sbId.includes('SLIME_BALL') || sbId.includes('SLIMEBALL')) return `${CDN_BASE_ITEMS}/slimeball.png`;
    if (sbId.includes('SLIME_BLOCK')) return `${CDN_BASE_BLOCKS}/slime.png`;
    if (sbId.includes('MAGMA_CREAM')) return `${CDN_BASE_ITEMS}/magma_cream.png`;
    if (sbId.includes('BLAZE_ROD')) return `${CDN_BASE_ITEMS}/blaze_rod.png`;
    if (sbId.includes('BLAZE_POWDER')) return `${CDN_BASE_ITEMS}/blaze_powder.png`;
    if (sbId.includes('GHAST_TEAR')) return `${CDN_BASE_ITEMS}/ghast_tear.png`;
    if (sbId.includes('ENDER_PEARL')) return `${CDN_BASE_ITEMS}/ender_pearl.png`;
    if (sbId.includes('EYE_OF_ENDER')) return `${CDN_BASE_ITEMS}/ender_eye.png`;
    if (sbId.includes('STRING')) return `${CDN_BASE_ITEMS}/string.png`;
    if (sbId.includes('SPIDER_EYE')) return `${CDN_BASE_ITEMS}/spider_eye.png`;
    if (sbId.includes('FERMENTED_SPIDER_EYE')) return `${CDN_BASE_ITEMS}/spider_eye_fermented.png`;
    if (sbId.includes('ROTTEN_FLESH')) return `${CDN_BASE_ITEMS}/rotten_flesh.png`;
    if (sbId.includes('BONE')) return `${CDN_BASE_ITEMS}/bone.png`;
    if (sbId.includes('GUNPOWDER')) return `${CDN_BASE_ITEMS}/gunpowder.png`;
    if (sbId.includes('LEATHER')) return `${CDN_BASE_ITEMS}/leather.png`;
    if (sbId.includes('FEATHER')) return `${CDN_BASE_ITEMS}/feather.png`;
    if (sbId.includes('EGG')) return `${CDN_BASE_ITEMS}/egg.png`;
  }

  // 3. Minecraft Numerical ID resolution
  const numericId = parseInt(item.id, 10);
  if (numericId) {
    // Player Skull / Heads (ID 397)
    if (numericId === 397) {
      if (item.damage === 1) return '/textures/minecraft/wither_skeleton_skull.png';
      return 'https://mc-heads.net/head/steve/64';
    }

    // Dyes (ID 351)
    if (numericId === 351) {
      const dyeName = MC_DYES_MAP[item.damage || 0] || 'dye_powder_black';
      return `${CDN_BASE_ITEMS}/${dyeName}.png`;
    }

    // Standard Items & Blocks
    if (MC_ITEMS_MAP[numericId]) {
      return `${CDN_BASE_ITEMS}/${MC_ITEMS_MAP[numericId]}.png`;
    }
    if (MC_BLOCKS_MAP[numericId]) {
      return `${CDN_BASE_BLOCKS}/${MC_BLOCKS_MAP[numericId]}.png`;
    }
  }

  // 4. Name / Keyword Pattern Fallback
  const name = (item.cleanName || item.rawName || '').toLowerCase();
  if (name.includes('sword') || name.includes('blade') || name.includes('katana') || name.includes('scythe') || name.includes('dagger') || name.includes('claymore')) {
    if (name.includes('hyperion') || name.includes('valkyrie') || name.includes('scylla') || name.includes('astraea') || name.includes('giant') || name.includes('iron')) {
      return `${CDN_BASE_ITEMS}/iron_sword.png`;
    }
    if (name.includes('gold') || name.includes('midas') || name.includes('rogue')) {
      return `${CDN_BASE_ITEMS}/gold_sword.png`;
    }
    if (name.includes('stone') || name.includes('livid') || name.includes('fury')) {
      return `${CDN_BASE_ITEMS}/stone_sword.png`;
    }
    return `${CDN_BASE_ITEMS}/diamond_sword.png`;
  }

  if (name.includes('bow') || name.includes('terminator') || name.includes('juju')) {
    return `${CDN_BASE_ITEMS}/bow_standby.png`;
  }
  if (name.includes('arrow')) {
    return `${CDN_BASE_ITEMS}/arrow.png`;
  }
  if (name.includes('pickaxe') || name.includes('drill') || name.includes('gauntlet')) {
    return `${CDN_BASE_ITEMS}/diamond_pickaxe.png`;
  }
  if (name.includes('axe') || name.includes('chopper')) {
    return `${CDN_BASE_ITEMS}/diamond_axe.png`;
  }
  if (name.includes('shovel') || name.includes('spade')) {
    return `${CDN_BASE_ITEMS}/diamond_shovel.png`;
  }
  if (name.includes('hoe')) {
    return `${CDN_BASE_ITEMS}/golden_hoe.png`;
  }
  if (name.includes('rod')) {
    return `${CDN_BASE_ITEMS}/fishing_rod_uncast.png`;
  }
  if (name.includes('helmet') || name.includes('hat') || name.includes('crown') || name.includes('mask') || name.includes('hood')) {
    return `${CDN_BASE_ITEMS}/diamond_helmet.png`;
  }
  if (name.includes('chestplate') || name.includes('tunic') || name.includes('jacket') || name.includes('cloak')) {
    return `${CDN_BASE_ITEMS}/diamond_chestplate.png`;
  }
  if (name.includes('leggings') || name.includes('pants') || name.includes('trousers')) {
    return `${CDN_BASE_ITEMS}/diamond_leggings.png`;
  }
  if (name.includes('boots') || name.includes('shoes')) {
    return `${CDN_BASE_ITEMS}/diamond_boots.png`;
  }
  if (name.includes('potion')) {
    return `${CDN_BASE_ITEMS}/potion_bottle_drinkable.png`;
  }
  if (name.includes('book') || name.includes('scroll') || name.includes('enchant')) {
    return `${CDN_BASE_ITEMS}/book_enchanted.png`;
  }
  if (name.includes('pearl')) {
    return `${CDN_BASE_ITEMS}/ender_pearl.png`;
  }
  if (name.includes('star')) {
    return `${CDN_BASE_ITEMS}/nether_star.png`;
  }
  if (name.includes('cookie')) {
    return `${CDN_BASE_ITEMS}/cookie.png`;
  }
  if (name.includes('diamond')) {
    return `${CDN_BASE_ITEMS}/diamond.png`;
  }
  if (name.includes('emerald')) {
    return `${CDN_BASE_ITEMS}/emerald.png`;
  }
  if (name.includes('gold')) {
    return `${CDN_BASE_ITEMS}/gold_ingot.png`;
  }
  if (name.includes('iron')) {
    return `${CDN_BASE_ITEMS}/iron_ingot.png`;
  }
  if (name.includes('coal')) {
    return `${CDN_BASE_ITEMS}/coal.png`;
  }

  return null;
}
